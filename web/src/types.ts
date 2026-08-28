export interface Color {
  id: string;
  name: string;
  hexCode: string;
  sortOrder: number;
}

export interface ClientRegistrationInput {
  fullName: string;
  cpf: string;
  email: string;
  colorId: string;
  notes?: string;
  /** Honeypot: must stay empty. Real users never see or fill this field. */
  website?: string;
}

export interface ApiErrorResponse {
  message: string;
  issues?: { path: string; message: string }[];
}
