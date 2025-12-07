export const isPostalCode = (v: string) => /^\d{2}-\d{3}$/.test(v);
export const isPesel = (v: string) => /^\d{11}$/.test(v);
export const isNip = (v: string) => /^\d{10}$/.test(v);
export const isRegon = (v: string) => /^(\d{9}|\d{14})$/.test(v);
export const isPhone = (v: string) =>
  /^(\+48)?\s?\d{9}$/.test(v.replace(/\s+/g, ''));

export const cleanDigits = (v: string) => v.replace(/\D+/g, '');
export const cleanPhone = (v: string) => v.replace(/[^\d+]/g, '');

