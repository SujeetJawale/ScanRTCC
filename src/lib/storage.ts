import AsyncStorage from "@react-native-async-storage/async-storage";

export type Invoice = {
  id: string;
  vendor: string;
  dateISO: string;
  total: number;
  invoiceNumber?: string;
  itemCount?: number;
  pdfUri?: string;
  images?: string[];
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

const VENDOR_KEY = "SCANIFY_VENDORS";

// ✅ Save vendor to dropdown list
export async function saveVendorName(name: string) {
  if (!name) return;
  try {
    const raw = await AsyncStorage.getItem(VENDOR_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (!list.includes(name)) {
      list.unshift(name);
      const limited = list.slice(0, 5); // keep only latest 5
      await AsyncStorage.setItem(VENDOR_KEY, JSON.stringify(limited));
    }
  } catch (e) {
    console.error("saveVendorName error:", e);
  }
}

// ✅ Load vendor list
export async function loadVendors(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(VENDOR_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
