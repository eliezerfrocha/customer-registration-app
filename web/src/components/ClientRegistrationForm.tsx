import { FormEvent, useState } from "react";
import { useColors } from "../hooks/useColors";
import { ApiError, registerClient } from "../services/api";
import { maskCpf } from "../utils/cpfMask";
import { ColorPicker } from "./ColorPicker";
import { AlertCircleIcon, CheckCircleIcon } from "./icons";

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

  const isSubmitting = status.type === "submitting";
  const selectedColor = colors.find((color) => color.id === form.colorId);

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

  if (status.type === "success") {
    return (
      <div className="result-card success" role="status">
        <div className="result-icon success">
          <CheckCircleIcon />
        </div>
        <h2>Cadastro realizado!</h2>
        <p>
          Obrigado, <strong>{form.fullName.split(" ")[0]}</strong>. Seus dados foram salvos com
          sucesso.
        </p>
        {selectedColor && (
          <div className="result-color">
            <span className="color-preview-dot" style={{ backgroundColor: selectedColor.hexCode }} />
            Cor preferida: <strong>{selectedColor.name}</strong>
          </div>
        )}
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setForm(initialState);
            setStatus({ type: "idle" });
          }}
        >
          Cadastrar outro cliente
        </button>
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
        />
      </div>

      <div className="field">
        <label>Cor preferida</label>
        <ColorPicker
          colors={colors}
          value={form.colorId}
          onChange={(colorId) => updateField("colorId", colorId)}
          disabled={isSubmitting}
          isLoading={isLoadingColors}
        />
      </div>

      <div className="field">
        <label htmlFor="notes">Observações</label>
        <textarea
          id="notes"
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar cadastro"}
      </button>

      {status.type === "error" && (
        <div className="feedback error" role="alert">
          <AlertCircleIcon />
          <span>{status.message}</span>
        </div>
      )}
    </form>
  );
}
