export function maskDni(dni: string): string {
  if (dni.length <= 4) return dni;
  return "*".repeat(dni.length - 4) + dni.slice(-4);
}

export function maskPhone(phone: string): string {
  if (phone.length <= 3) return phone;
  return "*".repeat(phone.length - 3) + phone.slice(-3);
}
