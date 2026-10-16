/**
 * Default pre-filled message for "contact the artisan" WhatsApp links.
 * Use with encodeURIComponent in a wa.me `?text=` param. (The profile share
 * link is intentionally separate — it carries the profile URL, not this text.)
 */
export const WHATSAPP_PREFILL =
  'Bonjour, je vous ai trouvé via la plateforme Biso et je souhaite discuter de vos services.';

export function cleanWhatsappNumber(phone: string): string {
  if (!phone) return '';

  const firstNumber = phone.split('/')[0].trim();
  const cleaned = firstNumber.replace(/\D/g, '');

  // Stored as +225XXXXXXXXXX or 225XXXXXXXXXX — keep country code as-is.
  if (cleaned.startsWith('225')) return cleaned;

  // Côte d'Ivoire local numbers: prepend country code.
  return '225' + cleaned;
}
