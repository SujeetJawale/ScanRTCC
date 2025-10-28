// Replace with your real key later
import * as FileSystem from "expo-file-system/legacy";

const OCR_API_KEY = "K82166208188957"; // Replace with your API key
const OCR_URL = "https://api.ocr.space/parse/image";

async function runSingleOCR(imageUri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const formData = new FormData();
    formData.append("apikey", OCR_API_KEY);
    formData.append("isTable", "true");
    formData.append("scale", "true");
    formData.append("OCREngine", "2");
    formData.append("base64Image", `data:image/jpg;base64,${base64}`);

    const res = await withTimeout(
      fetch(OCR_URL, {
        method: "POST",
        body: formData,
      }),
      25000 // 25 s timeout
    );

    const data = await res.json();

    if (data?.ParsedResults?.length > 0) {
      return data.ParsedResults.map((r: any) => r.ParsedText).join("\n");
    }
    return "";
  } catch (e) {
    console.error("OCR error:", e);
    return "";
  }
}

async function withTimeout<T>(promise: Promise<T>, ms = 25000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("OCR request timed out")), ms)),
  ]);
}

// 🔹 NEW: Run OCR on multiple pages
export async function runOCRMulti(images: string[]): Promise<string> {
  try {
    const results: string[] = [];
    for (const img of images) {
      const text = await runSingleOCR(img);
      if (text) results.push(text);
    }
    return results.join("\n---PAGE BREAK---\n");
  } catch (e) {
    console.error("Multi-page OCR failed:", e);
    return "";
  }
}
