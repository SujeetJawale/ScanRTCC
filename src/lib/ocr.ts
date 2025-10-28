import * as FileSystem from "expo-file-system";

/**
 * Runs OCR using OCR.Space free API.
 * Works with Expo SDK 54+ (no deprecated FileSystem calls)
 */
const OCR_API_KEY = "K82166208188957"; // Replace with your real key later

export async function runOCR(imageUri: string): Promise<string> {
  try {
    // ✅ Use the new FileSystem API: create a File handle and read as Base64
    const file = await FileSystem.getInfoAsync(imageUri);
    if (!file.exists) {
      console.warn("File not found:", imageUri);
      return "";
    }

    // Expo 54+: use readAsStringAsync with string literal encoding
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: "base64",
    });

    const body = new FormData();
    body.append("apikey", OCR_API_KEY);
    body.append("base64Image", `data:image/jpg;base64,${base64}`);
    body.append("language", "eng");

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body,
    });

    const result = await response.json();

    if (result?.ParsedResults?.[0]?.ParsedText) {
      return result.ParsedResults[0].ParsedText;
    } else {
      console.warn("OCR response error:", result);
      return "";
    }
  } catch (e: any) {
    console.error("OCR request failed:", e?.message);
    return "";
  }
}
