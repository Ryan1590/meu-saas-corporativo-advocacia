const digitsOnly = (value: string) => value.replace(/\D/g, '');

export const formatCpf = (value: string) => {
  const digits = digitsOnly(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export const formatCnpj = (value: string) => {
  const digits = digitsOnly(value).slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

export const formatRg = (value: string) => {
  const normalized = value.toUpperCase().replace(/[^0-9X]/g, '').slice(0, 9);
  return normalized
    .replace(/(\w{2})(\w)/, '$1.$2')
    .replace(/(\w{3})(\w)/, '$1.$2')
    .replace(/(\w{3})(\w{1})$/, '$1-$2');
};

export const formatCep = (value: string) => {
  const digits = digitsOnly(value).slice(0, 8);
  return digits.replace(/(\d{5})(\d)/, '$1-$2');
};

export const formatPhoneBR = (value: string) => {
  const digits = digitsOnly(value).slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 10) return digits.replace(/(\d{2})(\d{0,4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

export const formatOab = (value: string) => digitsOnly(value)
  .slice(0, 10)
  .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const formatCnj = (value: string) => {
  const digits = digitsOnly(value).slice(0, 20);
  return digits
    .replace(/(\d{7})(\d)/, '$1-$2')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{4})(\d)/, '$1.$2')
    .replace(/(\d)(\d)/, '$1.$2');
};

export const formatBrlInput = (value: string) => {
  const digits = digitsOnly(value).replace(/^0+(?=\d)/, '') || '0';
  const cents = digits.padStart(3, '0');
  const integer = cents.slice(0, -2).replace(/^0+(?=\d)/, '') || '0';
  const decimal = cents.slice(-2);
  return `R$ ${integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimal}`;
};

export const formatBrlDecimal = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') return '';
  const normalized = String(value).trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return '';
  const [integer, decimal = ''] = normalized.split('.');
  return `R$ ${(integer.replace(/^0+(?=\d)/, '') || '0').replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimal.padEnd(2, '0')}`;
};

export const brlToDecimal = (value: string) => {
  const digits = digitsOnly(value);
  if (!digits) return '';
  const cents = digits.padStart(3, '0');
  const integer = cents.slice(0, -2).replace(/^0+(?=\d)/, '') || '0';
  return `${integer}.${cents.slice(-2)}`;
};