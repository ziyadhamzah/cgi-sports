export function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidPhone(value: string) {
  const phone = normalizePhone(value);
  return phone.length >= 10 && phone.length <= 15;
}

export function isValidPostalCode(value: string) {
  return /^\d{5}$/.test(value.trim());
}
