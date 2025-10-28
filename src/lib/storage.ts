import AsyncStorage from "@react-native-async-storage/async-storage";

export type Invoice = {
  id: string;
  vendor: string;
  dateISO: string;
  total: number;
  invoiceNumber?: string;
  itemCount?: number;
  pdfUri?: string;
};

const STORAGE_KEY = "SCANIFY_INVOICES";

export async function loadInvoices(): Promise<Invoice[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("loadInvoices error:", e);
    return [];
  }
}

export async function saveInvoice(newInvoice: Invoice) {
  try {
    const list = await loadInvoices();
    const index = list.findIndex((i) => i.id === newInvoice.id);
    if (index >= 0) list[index] = newInvoice;
    else list.unshift(newInvoice);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("saveInvoice error:", e);
  }
}

export async function deleteInvoice(id: string) {
  try {
    const list = await loadInvoices();
    const updated = list.filter((i) => i.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("deleteInvoice error:", e);
  }
}

export async function clearInvoices() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("clearInvoices error:", e);
  }
}
