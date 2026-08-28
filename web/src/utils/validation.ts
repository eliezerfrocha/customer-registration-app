function isValidCpf(rawCpf: string): boolean {
  const cpf = rawCpf.replace(/\D/g, "");

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

  return calculateCheckDigit(9) === digits[9] && calculateCheckDigit(10) === digits[10];
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ClientFormValues {
  fullName: string;
  cpf: string;
  email: string;
  colorId: string;
  notes: string;
}

export type ClientFormErrors = Partial<Record<keyof ClientFormValues, string>>;

export function validateClientForm(values: ClientFormValues): ClientFormErrors {
  const errors: ClientFormErrors = {};

  if (values.fullName.trim().length < 3) {
    errors.fullName = "Informe o nome completo (mínimo 3 caracteres).";
  }

  if (!isValidCpf(values.cpf)) {
    errors.cpf = "CPF inválido. Confira os números digitados.";
  }

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Informe um e-mail válido.";
  }

  if (!values.colorId) {
    errors.colorId = "Selecione uma cor preferida.";
  }

  if (values.notes.length > 1000) {
    errors.notes = "Observações muito longas (máximo 1000 caracteres).";
  }

  return errors;
}
