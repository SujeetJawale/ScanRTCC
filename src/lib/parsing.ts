export function parseInvoiceText(text: string) {
  let vendor = "";
  let total = "";
  let date = "";

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2);
  if (lines.length > 0) vendor = lines[0];

  const totalMatch =
    text.match(/(?:TOTAL|Amount|Balance)[^\d]*(\d+[.,]\d{2})/i) ||
    text.match(/(\d+[.,]\d{2})\s*(?:USD|Rs|INR|$)/i);
  if (totalMatch) total = totalMatch[1];

  const dateMatch = text.match(
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})|(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/i
  );
  if (dateMatch) date = dateMatch[0];

  return { vendor, total, date };
}
