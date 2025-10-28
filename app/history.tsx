import * as FileSystem from "expo-file-system/legacy";
import * as MailComposer from "expo-mail-composer";
import { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import XLSX from "xlsx";
import { clearInvoices, Invoice, loadInvoices } from "../src/lib/storage";

const CACHE_DIR = ((FileSystem as any).cacheDirectory ||
  (FileSystem as any).documentDirectory ||
  "") as string;

export default function History() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    refreshInvoices();
  }, []);

  async function refreshInvoices() {
    const data = await loadInvoices();
    setInvoices(data);
  }

  const total = invoices.reduce((sum, inv) => sum + inv.total, 0);

  // ---------------- Excel Builder ----------------
  async function buildExcel() {
    const data = invoices.map((i) => ({
      Vendor: i.vendor,
      Date: new Date(i.dateISO).toLocaleDateString(),
      InvoiceNo: i.invoiceNumber || "",
      Items: i.itemCount || 0,
      Total: i.total,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");
    const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

    const fileUri = CACHE_DIR + `daily_summary_${Date.now()}.xlsx`;
    await FileSystem.writeAsStringAsync(fileUri, wbout, { encoding: "base64" });

    return fileUri.startsWith("file://") ? fileUri : `file://${fileUri}`;
  }

  // ---------------- Email All ----------------
  async function emailAll() {
    if (!invoices.length) {
      Alert.alert("No invoices", "There are no saved invoices to email.");
      return;
    }

    try {
      setBusy(true);

      // Build Excel
      const excelUri = await buildExcel();

      // Collect all scanned invoice PDFs (photo PDFs)
      const attachments: string[] = [];
      for (const inv of invoices) {
        if (inv.pdfUri) {
          const info = await FileSystem.getInfoAsync(inv.pdfUri);
          if (info.exists) {
            attachments.push(inv.pdfUri.startsWith("file://") ? inv.pdfUri : `file://${inv.pdfUri}`);
          }
        }
      }

      attachments.push(excelUri);

      const available = await MailComposer.isAvailableAsync();
      if (!available) {
        Alert.alert(
          "Mail not available",
          "Mail composer isn't supported on simulator. Please test on a real iPhone."
        );
        setBusy(false);
        return;
      }

      await MailComposer.composeAsync({
        recipients: ["sjawale@usc.edu"],
        subject: `RTCC Daily Invoices - ${new Date().toLocaleDateString()}`,
        body: `Attached are ${
          invoices.length
        } invoice photos and a daily Excel summary.\n\nTotal: $${total.toFixed(2)}`,
        attachments,
      });

      await clearInvoices();
      setInvoices([]);
      Alert.alert("Done", "Invoices emailed and cleared for next day!");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not send email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Invoices</Text>

      <FlatList
        data={invoices}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.vendor}>{item.vendor}</Text>
            <Text>
              {new Date(item.dateISO).toLocaleDateString()} - ${item.total}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text>No saved invoices yet.</Text>}
      />

      <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>

      <Pressable
        onPress={emailAll}
        disabled={busy || !invoices.length}
        style={[styles.button, { opacity: busy || !invoices.length ? 0.5 : 1 }]}
      >
        <Text style={styles.buttonText}>{busy ? "Sending…" : "📧 Email All (Photos + Excel)"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 10 },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  vendor: { fontWeight: "700" },
  total: { fontSize: 18, fontWeight: "700", textAlign: "right", marginTop: 10 },
  button: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});
