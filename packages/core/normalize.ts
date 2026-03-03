export function parseCurrency(value: string | undefined): number | undefined {
  if (!value) return undefined;
  return parseBrazilianNumber(value);
}

export function parseQuantity(value: string | undefined): number | undefined {
  if (!value) return undefined;
  return parseBrazilianNumber(value);
}

function parseBrazilianNumber(value: string): number | undefined {
  // Remove spaces, letters, currency symbols. Keep digits, dot, comma, hyphen.
  let clean = value.replace(/[^\d.,\-]/g, '');
  if (!clean) return undefined;

  // If the number contains a comma, assume it's the Brazilian decimal separator (e.g. 1.234,56 or 75,90)
  if (clean.includes(',')) {
    clean = clean.replace(/\./g, '').replace(',', '.');
  }
  // Otherwise, the dot is already the decimal separator (e.g. 1.0000 or 100.00), so we just parse it.

  const num = parseFloat(clean);
  return isNaN(num) ? undefined : num;
}

export function cleanText(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.replace(/\s+/g, ' ').trim() || undefined;
}
