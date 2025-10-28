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
} from "react-native";
import { runOCR } from "../src/lib/ocr";
import { parseInvoiceText } from "../src/lib/parsing";
import { saveInvoice } from "../src/lib/storage";

const CACHE_DIR = ((FileSystem as any).cacheDirectory ||
  (FileSystem as any).documentDirectory ||
  "") as string;

export default function Review() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // ✅ State (pre-filled if editing)
  const [vendor, setVendor] = useState((params.vendor as string) || "");
  const [date, setDate] = useState((params.date as string) || new Date().toISOString().slice(0, 10));
  const [total, setTotal] = useState((params.total as string) || "");
  const [invoiceNumber, setInvoiceNumber] = useState((params.invoiceNumber as string) || "");
  const [itemCount, setItemCount] = useState((params.itemCount as string) || "");
  const [imageUri, setImageUri] = useState((params.imageUri as string) || "");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState((params.id as string) || "");

  // 🔹 Run OCR if new image (not editing)
  useEffect(() => {
    (async () => {
      if (imageUri && !editingId) {
        setBusy(true);
        const text = await runOCR(imageUri);
        if (text) {
          const parsed = parseInvoiceText(text);
          if (parsed.vendor) setVendor(parsed.vendor);
          if (parsed.total) setTotal(parsed.total);
          if (parsed.date) setDate(parsed.date);
        } else {
          Alert.alert("OCR failed", "Could not extract text. Fill manually.");
        }
        setBusy(false);
      }
    })();
  }, [imageUri]);

  // ---------------- PDF Builder ----------------
  async function buildPDF(vendor: string, date: string, total: string) {
    const html = `
      <html><body style="font-family:-apple-system;padding:16px">
        <h2>Invoice Summary</h2>
        <p><b>Vendor:</b> ${vendor}<br/>
        <b>Date:</b> ${date}<br/>
        <b>Invoice No.:</b> ${invoiceNumber || "-"}<br/>
        <b>Items:</b> ${itemCount || "0"}<br/>
        <b>Total:</b> $${total}</p>
      </body></html>`;

    const { uri: tempUri } = await Print.printToFileAsync({ html });
    const safeVendor = vendor.replace(/\s+/g, "_") || "Invoice";
    const safeDate = date.replace(/[:\s]/g, "-");
    const newUri = `${CACHE_DIR}${safeVendor}_${safeDate}.pdf`;

    await FileSystem.copyAsync({ from: tempUri, to: newUri });
    await FileSystem.deleteAsync(tempUri, { idempotent: true });

    return newUri;
  }

  // ---------------- Save Invoice (New or Update) ----------------
  async function saveInvoiceData() {
    if (!vendor || !total) {
      Alert.alert("Missing info", "Please fill vendor and total.");
      return;
    }

    try {
      setBusy(true);
      const pdfUri = imageUri || (await buildPDF(vendor, date, total));
      const id = editingId || String(Date.now());

      const invoice = {
        id,
        vendor,
        dateISO: date,
        total: parseFloat(total),
        invoiceNumber,
        itemCount: parseInt(itemCount || "0"),
        pdfUri,
      };

      await saveInvoice(invoice); // ✅ unified storage call

      setBusy(false);
      Alert.alert("Saved", "Invoice saved successfully!", [
        { text: "OK", onPress: () => router.push("/summary") },
      ]);
    } catch (e: any) {
      setBusy(false);
      Alert.alert("Error", e.message || "Could not save invoice.");
    }
  }

  // ---------------- UI ----------------
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewImage} /> : null}

      <Text style={styles.label}>Vendor</Text>
      <TextInput value={vendor} onChangeText={setVendor} style={styles.input} placeholder='Vendor name' />

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

      <Pressable onPress={saveInvoiceData} disabled={busy} style={styles.button}>
        {busy ? (
          <ActivityIndicator color='#fff' />
        ) : (
          <Text style={styles.buttonText}>{editingId ? "Update Invoice" : "Save Invoice"}</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  previewImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
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
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});
