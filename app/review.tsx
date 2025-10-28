import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { runOCRMulti } from "../src/lib/ocr";
import { parseInvoiceText } from "../src/lib/parsing";
import { loadInvoices, loadVendors, saveInvoice, saveVendorName } from "../src/lib/storage";

const CACHE_DIR = ((FileSystem as any).cacheDirectory ||
  (FileSystem as any).documentDirectory ||
  "") as string;

export const options = {
  title: "Invoice Review",
};

export default function Review() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // ---------- STATE ----------
  const [images, setImages] = useState<string[]>(() => {
    try {
      if (params.images) {
        const parsed =
          typeof params.images === "string" ? JSON.parse(params.images as string) : params.images;
        if (Array.isArray(parsed)) return parsed;
      }
      if (params.imageUri) return [params.imageUri as string];
      return [];
    } catch {
      return [];
    }
  });

  const [vendor, setVendor] = useState((params.vendor as string) || "");
  const [date, setDate] = useState((params.date as string) || new Date().toLocaleDateString("en-CA"));
  const [total, setTotal] = useState((params.total as string) || "");
  const [invoiceNumber, setInvoiceNumber] = useState((params.invoiceNumber as string) || "");
  const [itemCount, setItemCount] = useState((params.itemCount as string) || "");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState((params.id as string) || "");
  const [vendors, setVendors] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // ---------- LOAD RECENT VENDORS ----------
  useEffect(() => {
    (async () => {
      const list = await loadVendors();
      setVendors(list);
    })();
  }, []);

  // ---------- OCR ----------
  useEffect(() => {
    (async () => {
      if (!images.length || editingId) return;
      setBusy(true);
      try {
        const text = await runOCRMulti(images);
        if (text) {
          const parsed = parseInvoiceText(text);
          if (parsed.vendor) setVendor(parsed.vendor);
          if (parsed.total) setTotal(parsed.total);
          if (parsed.date) setDate(parsed.date);
        } else {
          Alert.alert("OCR failed", "Could not extract text from images.");
        }
      } catch (e: any) {
        console.error("OCR failed:", e);
      } finally {
        setBusy(false);
      }
    })();
  }, [images]);

  // ---------- BUILD MULTI-PAGE PDF ----------
  async function buildPDF(vendor: string, date: string, total: string) {
    // Build HTML with multiple pages
    const imageHtml = images
      .map(
        (uri) => `
      <div style="page-break-after:always;">
        <img src="${uri}" style="width:100%;height:auto;margin-bottom:20px;"/>
      </div>`
      )
      .join("");

    const html = `
    <html><body style="margin:0;padding:0;font-family:-apple-system">
      ${imageHtml}
    </body></html>`;

    // Create temporary PDF
    const { uri: tempUri } = await Print.printToFileAsync({ html });

    // ✅ sanitize and ensure slash at the end of the dir
    const dir = CACHE_DIR.endsWith("/") ? CACHE_DIR : CACHE_DIR + "/";
    const safeVendor = vendor.replace(/[^a-z0-9_\-]/gi, "_") || "Invoice";
    const safeDate = date.replace(/[^a-z0-9_\-]/gi, "_");
    const newUri = `${dir}${safeVendor}_${safeDate}_${Date.now()}.pdf`;

    try {
      // Delete if file already exists
      const info = await FileSystem.getInfoAsync(newUri);
      if (info.exists) await FileSystem.deleteAsync(newUri, { idempotent: true });

      await FileSystem.copyAsync({ from: tempUri, to: newUri });
      await FileSystem.deleteAsync(tempUri, { idempotent: true });

      return newUri;
    } catch (e) {
      console.error("PDF save error:", e);
      throw new Error("Failed to save PDF file");
    }
  }

  // ---------- SAVE INVOICE ----------
  async function saveInvoiceData() {
    if (!vendor || !total) {
      Alert.alert("Missing info", "Please fill vendor and total.");
      return;
    }

    try {
      setBusy(true);

      const pdfUri = await buildPDF(vendor, date, total);
      const allInvoices = await loadInvoices();

      // ✅ Prevent duplicate invoice numbers
      if (invoiceNumber) {
        const duplicate = allInvoices.find(
          (i) => i.invoiceNumber && i.invoiceNumber.trim() === invoiceNumber.trim() && i.id !== editingId
        );
        if (duplicate) {
          Alert.alert(
            "Duplicate Invoice",
            `An invoice with number ${invoiceNumber} already exists for ${duplicate.vendor}.`,
            [{ text: "OK" }]
          );
          setBusy(false);
          return;
        }
      }

      const id = editingId || String(Date.now());
      const invoice = {
        id,
        vendor,
        dateISO: date,
        total: parseFloat(total),
        invoiceNumber,
        itemCount: parseInt(itemCount || "0"),
        pdfUri,
        images, // ✅ keep original photos
      };

      await saveInvoice(invoice);
      await saveVendorName(vendor); // ✅ remember new vendor

      setBusy(false);
      Alert.alert("Saved", "Invoice saved successfully!", [
        { text: "OK", onPress: () => router.push("/summary") },
      ]);
    } catch (e: any) {
      setBusy(false);
      Alert.alert("Error", e.message || "Could not save invoice.");
    }
  }

  // ---------- ADD PAGE ----------
  function addPage() {
    router.push({
      pathname: "/scan",
      params: {
        addMode: "true",
        images: JSON.stringify(images),
        vendor,
        date,
        total,
        invoiceNumber,
        itemCount,
        id: editingId || "",
      },
    });
  }

  // ---------- UI ----------
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {images.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.previewImage} />
          ))}
        </ScrollView>
      )}

      <View>
        <Text style={styles.label}>Vendor</Text>

        {/* Input + dropdown arrow */}
        <View style={styles.vendorRow}>
          <TextInput
            value={vendor}
            onChangeText={setVendor}
            style={[styles.input, { flex: 1 }]}
            placeholder='Vendor name'
          />
          {vendors.length > 0 && (
            <Pressable onPress={() => setShowDropdown(!showDropdown)} style={styles.iconButton}>
              <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={22} color='#111' />
            </Pressable>
          )}
        </View>

        {/* Dropdown list */}
        {showDropdown && vendors.length > 0 && (
          <View style={styles.dropdown}>
            {vendors.map((v) => (
              <Pressable
                key={v}
                onPress={() => {
                  setVendor(v);
                  setShowDropdown(false);
                }}
                style={styles.dropdownItem}
              >
                <Text>{v}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <Text style={styles.label}>Date</Text>
      <TextInput value={date} onChangeText={setDate} style={styles.input} placeholder='YYYY-MM-DD' />

      <Text style={styles.label}>Total ($)</Text>
      <TextInput value={total} onChangeText={setTotal} style={styles.input} keyboardType='decimal-pad' />

      <Text style={styles.label}>Invoice Number</Text>
      <TextInput
        value={invoiceNumber}
        onChangeText={setInvoiceNumber}
        style={styles.input}
        placeholder='e.g. INV-1024'
      />

      <Text style={styles.label}>Number of Items</Text>
      <TextInput
        value={itemCount}
        onChangeText={setItemCount}
        style={styles.input}
        keyboardType='numeric'
        placeholder='e.g. 5'
      />

      <Pressable
        onPress={async () => {
          setBusy(true);
          const text = await runOCRMulti(images);
          if (text) {
            const parsed = parseInvoiceText(text);
            if (parsed.vendor) setVendor(parsed.vendor);
            if (parsed.total) setTotal(parsed.total);
            if (parsed.date) setDate(parsed.date);
          } else {
            Alert.alert("OCR failed", "Try scanning again or fill manually.");
          }
          setBusy(false);
        }}
        style={[styles.button, { backgroundColor: "#F59E0B" }]}
      >
        {busy ? <ActivityIndicator color='#fff' /> : <Text style={styles.buttonText}>🔄 Re-run OCR</Text>}
      </Pressable>

      <Pressable
        onPress={saveInvoiceData}
        disabled={busy}
        style={[styles.button, { backgroundColor: "#16A34A" }]}
      >
        {busy ? (
          <ActivityIndicator color='#fff' />
        ) : (
          <Text style={styles.buttonText}>{editingId ? "Update Invoice" : "Save Invoice"}</Text>
        )}
      </Pressable>

      <Pressable onPress={addPage} disabled={busy} style={[styles.button, { backgroundColor: "#2563EB" }]}>
        <Text style={styles.buttonText}>➕ Add Page</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/summary")}
        style={[styles.button, { backgroundColor: "#9CA3AF" }]}
      >
        <Text style={styles.buttonText}>Back to Summary</Text>
      </Pressable>
    </ScrollView>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  previewImage: {
    width: 180,
    height: 220,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: "#ddd",
  },
  label: { fontWeight: "700" },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  button: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  vendorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    marginLeft: 8,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    marginTop: 4,
    overflow: "hidden",
  },
  dropdownItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
});
