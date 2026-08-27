import { FormEvent, useState } from "react";
import { useColors } from "../hooks/useColors";
import { ApiError, registerClient } from "../services/api";
import { maskCpf } from "../utils/cpfMask";

interface FormState {
  fullName: string;
  cpf: string;
  email: string;
  colorId: string;
  notes: string;
}

const initialState: FormState = {
  fullName: "",
  cpf: "",
  email: "",
  colorId: "",
  notes: "",
};

type SubmissionStatus =
  | { type: "idle" }
  | { type: "submitting" }
  | { type: "success" }
  | { type: "error"; message: string };

export function ClientRegistrationForm() {
  const { colors, isLoading: isLoadingColors } = useColors();
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<SubmissionStatus>({ type: "idle" });

  const isSubmitted = status.type === "success";

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus({ type: "submitting" });

    try {
      await registerClient({
        fullName: form.fullName,
        cpf: form.cpf,
        email: form.email,
        colorId: form.colorId,
        notes: form.notes || undefined,
      });
      setStatus({ type: "success" });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Não foi possível enviar o cadastro. Tente novamente.";
      setStatus({ type: "error", message });
    }
  }

  if (isSubmitted) {
    return (
      <div className="feedback success" role="status">
        Cadastro realizado com sucesso! Obrigado, {form.fullName.split(" ")[0]}.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="fullName">Nome completo</label>
        <input
          id="fullName"
          required
          minLength={3}
          value={form.fullName}
          onChange={(e) => updateField("fullName", e.target.value)}
          disabled={status.type === "submitting"}
        />
      </div>

      <div className="field">
        <label htmlFor="cpf">CPF</label>
        <input
          id="cpf"
          required
          inputMode="numeric"
          placeholder="000.000.000-00"
          value={form.cpf}
          onChange={(e) => updateField("cpf", maskCpf(e.target.value))}
          disabled={status.type === "submitting"}
        />
      </div>

      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          disabled={status.type === "submitting"}
        />
      </div>

      <div className="field">
        <label htmlFor="colorId">Cor preferida</label>
        <select
          id="colorId"
          required
          value={form.colorId}
          onChange={(e) => updateField("colorId", e.target.value)}
          disabled={status.type === "submitting" || isLoadingColors}
        >
          <option value="" disabled>
            {isLoadingColors ? "Carregando cores..." : "Selecione uma cor"}
          </option>
          {colors.map((color) => (
            <option key={color.id} value={color.id}>
              {color.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="notes">Observações</label>
        <textarea
          id="notes"
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          disabled={status.type === "submitting"}
        />
      </div>

      <button type="submit" disabled={status.type === "submitting"}>
        {status.type === "submitting" ? "Enviando..." : "Enviar cadastro"}
      </button>

      {status.type === "error" && (
        <div className="feedback error" role="alert">
          {status.message}
        </div>
      )}
    </form>
  );
}
