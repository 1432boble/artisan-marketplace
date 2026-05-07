export function cleanWhatsappNumber(phone: string): string {
  if (!phone) return '';

  const firstNumber = phone.split('/')[0].trim();
  let cleaned = firstNumber.replace(/\D/g, '');

  // Stored as +225XXXXXXXXXX or 225XXXXXXXXXX — keep country code as-is.
  if (cleaned.startsWith('225')) return cleaned;

  // Côte d'Ivoire local numbers: prepend country code.
  return '225' + cleaned;
}
