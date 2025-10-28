import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { deleteInvoice, Invoice, loadInvoices } from "../src/lib/storage";

export const unstable_settings = {
  headerShown: false,
};

export default function Summary() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  async function refreshInvoices() {
    const data = await loadInvoices();
    setInvoices(data);
  }

  useEffect(() => {
    refreshInvoices();
  }, []);

  async function removeInvoice(id: string) {
    await deleteInvoice(id);
    await refreshInvoices();
  }

  function editInvoice(item: Invoice) {
    router.push({
      pathname: "/review",
      params: {
        id: item.id,
        vendor: item.vendor,
        date: item.dateISO,
        total: String(item.total),
        invoiceNumber: item.invoiceNumber || "",
        itemCount: String(item.itemCount || ""),
        images: JSON.stringify(item.images || []), // ✅ pass all photos
        pdfUri: item.pdfUri || "",
      },
    });
  }

  function addMore() {
    router.push("/scan");
  }

  function done() {
    router.push("/");
  }

  const total = invoices.reduce((sum, i) => sum + i.total, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Invoices</Text>

      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.vendor}>{item.vendor}</Text>
              <Text>Date: {new Date(item.dateISO).toLocaleDateString()}</Text>
              <Text>Total: ${item.total.toFixed(2)}</Text>
            </View>
            <View style={styles.actions}>
              <Pressable
                style={[styles.smallBtn, { backgroundColor: "#2563EB" }]}
                onPress={() => editInvoice(item)}
              >
                <Text style={styles.btnText}>Edit</Text>
              </Pressable>
              <Pressable
                style={[styles.smallBtn, { backgroundColor: "#DC2626" }]}
                onPress={() => removeInvoice(item.id)}
              >
                <Text style={styles.btnText}>Del</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text>No invoices saved yet.</Text>}
      />

      <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>

      <View style={styles.bottomButtons}>
        <Pressable style={[styles.mainBtn, { backgroundColor: "#111827" }]} onPress={addMore}>
          <Text style={styles.mainText}>➕ Add More</Text>
        </Pressable>
        <Pressable style={[styles.mainBtn, { backgroundColor: "#16A34A" }]} onPress={done}>
          <Text style={styles.mainText}>✅ Done</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 10 },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vendor: { fontWeight: "700", marginBottom: 4 },
  actions: { flexDirection: "row", gap: 8 },
  smallBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  total: { fontSize: 18, fontWeight: "700", textAlign: "right", marginTop: 8 },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  mainBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  mainText: { color: "#fff", fontWeight: "700" },
});

export const options = {
  title: "Today's Summary",
};
