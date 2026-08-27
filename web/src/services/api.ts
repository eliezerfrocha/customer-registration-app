import { ApiErrorResponse, ClientRegistrationInput, Color } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  issues?: ApiErrorResponse["issues"];

  constructor(message: string, issues?: ApiErrorResponse["issues"]) {
    super(message);
    this.issues = issues;
  }
}

async function parseErrorResponse(response: Response): Promise<never> {
  const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
  throw new ApiError(body?.message ?? "Não foi possível completar a solicitação.", body?.issues);
}

export async function fetchColors(): Promise<Color[]> {
  const response = await fetch(`${API_URL}/api/colors`);
  if (!response.ok) {
    return parseErrorResponse(response);
  }
  return response.json();
}

export async function registerClient(input: ClientRegistrationInput): Promise<void> {
  const response = await fetch(`${API_URL}/api/clients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    return parseErrorResponse(response);
  }
}
