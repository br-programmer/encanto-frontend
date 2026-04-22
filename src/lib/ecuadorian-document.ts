// Ecuadorian SRI document validation helpers.
// Mirrors the backend algorithms (cedula mod 10, RUC mod 11).

const CEDULA_LENGTH = 10;
const RUC_LENGTH = 13;
const PASSPORT_MIN = 6;
const PASSPORT_MAX = 20;

export function isValidCedula(value: string): boolean {
  if (!/^\d{10}$/.test(value)) return false;
  const digits = value.split("").map(Number);
  const province = digits[0] * 10 + digits[1];
  if (province < 1 || province > 24) return false;
  if (digits[2] >= 6) return false; // third digit must be 0-5 for natural persons

  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let total = 0;
  for (let i = 0; i < 9; i++) {
    let result = digits[i] * coefficients[i];
    if (result >= 10) result -= 9;
    total += result;
  }
  const verifier = total % 10 === 0 ? 0 : 10 - (total % 10);
  return verifier === digits[9];
}

export function isValidRuc(value: string): boolean {
  if (!/^\d{13}$/.test(value)) return false;
  // RUC is cedula (10) + '001' for natural persons; companies have different
  // third digit. We accept any well-formed RUC and validate the 10-digit
  // cedula checksum for natural-person RUCs, matching the backend policy.
  if (!value.endsWith("001")) return false;

  const thirdDigit = Number(value[2]);
  if (thirdDigit < 6) {
    // Natural person: validate embedded cedula
    return isValidCedula(value.substring(0, 10));
  }
  // Public or private companies pass the structural check; defer to backend
  // for full modulus validation.
  return thirdDigit === 6 || thirdDigit === 9;
}

export function isValidPassport(value: string): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.length < PASSPORT_MIN || trimmed.length > PASSPORT_MAX) return false;
  return /^[A-Za-z0-9]+$/.test(trimmed);
}

export type DocType = "cedula" | "ruc" | "pasaporte";

export function validateDocumentByType(
  type: DocType,
  value: string
): { valid: boolean; error?: string } {
  if (!value) return { valid: false, error: "Ingresa un número de documento" };
  if (type === "cedula") {
    if (value.length !== CEDULA_LENGTH) {
      return { valid: false, error: `La cédula debe tener ${CEDULA_LENGTH} dígitos` };
    }
    return isValidCedula(value)
      ? { valid: true }
      : { valid: false, error: "Cédula inválida" };
  }
  if (type === "ruc") {
    if (value.length !== RUC_LENGTH) {
      return { valid: false, error: `El RUC debe tener ${RUC_LENGTH} dígitos` };
    }
    return isValidRuc(value)
      ? { valid: true }
      : { valid: false, error: "RUC inválido" };
  }
  // pasaporte
  return isValidPassport(value)
    ? { valid: true }
    : { valid: false, error: "Pasaporte inválido" };
}

export const DOCUMENT_TYPE_LABELS: Record<DocType, string> = {
  cedula: "Cédula",
  ruc: "RUC",
  pasaporte: "Pasaporte",
};
