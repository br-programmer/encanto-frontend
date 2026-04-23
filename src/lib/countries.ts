export interface Country {
  code: string;
  dialCode: string;
  flag: string;
  name: string;
  /** Regex to validate the LOCAL number (without country code) */
  localPattern: RegExp;
  /** Error message when validation fails */
  localError: string;
  /** Placeholder for the local number — also used to derive display grouping */
  localPlaceholder: string;
}

export const COUNTRIES: Country[] = [
  { code: "EC", dialCode: "+593", flag: "🇪🇨", name: "Ecuador", localPattern: /^9\d{8}$/, localError: "Debe empezar con 9 y tener 9 dígitos", localPlaceholder: "9XX XXX XXXX" },
  { code: "US", dialCode: "+1", flag: "🇺🇸", name: "Estados Unidos", localPattern: /^\d{10}$/, localError: "Debe tener 10 dígitos", localPlaceholder: "XXX XXX XXXX" },
  { code: "CO", dialCode: "+57", flag: "🇨🇴", name: "Colombia", localPattern: /^3\d{9}$/, localError: "Debe empezar con 3 y tener 10 dígitos", localPlaceholder: "3XX XXX XXXX" },
  { code: "PE", dialCode: "+51", flag: "🇵🇪", name: "Perú", localPattern: /^9\d{8}$/, localError: "Debe empezar con 9 y tener 9 dígitos", localPlaceholder: "9XX XXX XXX" },
  { code: "MX", dialCode: "+52", flag: "🇲🇽", name: "México", localPattern: /^\d{10}$/, localError: "Debe tener 10 dígitos", localPlaceholder: "XXX XXX XXXX" },
  { code: "ES", dialCode: "+34", flag: "🇪🇸", name: "España", localPattern: /^[6-9]\d{8}$/, localError: "Debe empezar con 6-9 y tener 9 dígitos", localPlaceholder: "6XX XXX XXX" },
  { code: "AR", dialCode: "+54", flag: "🇦🇷", name: "Argentina", localPattern: /^\d{10}$/, localError: "Debe tener 10 dígitos", localPlaceholder: "XX XXXX XXXX" },
  { code: "CL", dialCode: "+56", flag: "🇨🇱", name: "Chile", localPattern: /^9\d{8}$/, localError: "Debe empezar con 9 y tener 9 dígitos", localPlaceholder: "9XX XXX XXX" },
  { code: "BR", dialCode: "+55", flag: "🇧🇷", name: "Brasil", localPattern: /^\d{10,11}$/, localError: "Debe tener 10 u 11 dígitos", localPlaceholder: "XX XXXXX XXXX" },
  { code: "VE", dialCode: "+58", flag: "🇻🇪", name: "Venezuela", localPattern: /^4\d{9}$/, localError: "Debe empezar con 4 y tener 10 dígitos", localPlaceholder: "4XX XXX XXXX" },
  { code: "PA", dialCode: "+507", flag: "🇵🇦", name: "Panamá", localPattern: /^6\d{7}$/, localError: "Debe empezar con 6 y tener 8 dígitos", localPlaceholder: "6XXX XXXX" },
  { code: "CR", dialCode: "+506", flag: "🇨🇷", name: "Costa Rica", localPattern: /^\d{8}$/, localError: "Debe tener 8 dígitos", localPlaceholder: "XXXX XXXX" },
  { code: "BO", dialCode: "+591", flag: "🇧🇴", name: "Bolivia", localPattern: /^[67]\d{7}$/, localError: "Debe empezar con 6 o 7 y tener 8 dígitos", localPlaceholder: "7XXX XXXX" },
  { code: "UY", dialCode: "+598", flag: "🇺🇾", name: "Uruguay", localPattern: /^9\d{7}$/, localError: "Debe empezar con 9 y tener 8 dígitos", localPlaceholder: "9X XXX XXX" },
  { code: "PY", dialCode: "+595", flag: "🇵🇾", name: "Paraguay", localPattern: /^9\d{8}$/, localError: "Debe empezar con 9 y tener 9 dígitos", localPlaceholder: "9XX XXX XXX" },
  { code: "DO", dialCode: "+1", flag: "🇩🇴", name: "Rep. Dominicana", localPattern: /^\d{10}$/, localError: "Debe tener 10 dígitos", localPlaceholder: "XXX XXX XXXX" },
  { code: "GT", dialCode: "+502", flag: "🇬🇹", name: "Guatemala", localPattern: /^\d{8}$/, localError: "Debe tener 8 dígitos", localPlaceholder: "XXXX XXXX" },
  { code: "HN", dialCode: "+504", flag: "🇭🇳", name: "Honduras", localPattern: /^[389]\d{7}$/, localError: "Debe empezar con 3, 8 o 9 y tener 8 dígitos", localPlaceholder: "9XXX XXXX" },
  { code: "SV", dialCode: "+503", flag: "🇸🇻", name: "El Salvador", localPattern: /^[267]\d{7}$/, localError: "Debe empezar con 2, 6 o 7 y tener 8 dígitos", localPlaceholder: "7XXX XXXX" },
  { code: "NI", dialCode: "+505", flag: "🇳🇮", name: "Nicaragua", localPattern: /^[578]\d{7}$/, localError: "Debe empezar con 5, 7 u 8 y tener 8 dígitos", localPlaceholder: "8XXX XXXX" },
];

/**
 * Find the best-matching country for an E.164-ish phone (`+XXX...`).
 * Matches the longest dial code first (so `+593` beats `+59`) and returns
 * the first country with that dial code (ambiguous codes like `+1` resolve
 * to the first entry — formatting is identical for shared codes).
 */
export function findCountryByDialCode(phone: string): Country | undefined {
  const trimmed = phone.trim();
  if (!trimmed.startsWith("+")) return undefined;
  const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  return sorted.find((c) => trimmed.startsWith(c.dialCode));
}
