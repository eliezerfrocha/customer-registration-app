export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Valida um CPF verificando os dígitos verificadores (algoritmo oficial).
 * Rejeita CPFs com todos os dígitos iguais (ex: 000.000.000-00), que
 * passariam no cálculo mas são inválidos na prática.
 */
export function isValidCpf(rawCpf: string): boolean {
  const cpf = onlyDigits(rawCpf);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const digits = cpf.split("").map(Number);

  const calculateCheckDigit = (length: number): number => {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += digits[i] * (length + 1 - i);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const firstCheckDigit = calculateCheckDigit(9);
  const secondCheckDigit = calculateCheckDigit(10);

  return firstCheckDigit === digits[9] && secondCheckDigit === digits[10];
}
