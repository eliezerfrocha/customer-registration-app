import { FormEvent, useRef, useState } from "react";
import { useColors } from "../hooks/useColors";
import { ApiError, registerClient } from "../services/api";
import { maskCpf } from "../utils/cpfMask";
import { ClientFormErrors, ClientFormValues, validateClientForm } from "../utils/validation";
import { ColorSelect } from "./ColorSelect";
import { AlertCircleIcon, CheckCircleIcon } from "./icons";

const initialState: ClientFormValues = {
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
  const [form, setForm] = useState<ClientFormValues>(initialState);
  const [fieldErrors, setFieldErrors] = useState<ClientFormErrors>({});
  const [status, setStatus] = useState<SubmissionStatus>({ type: "idle" });
  const [shake, setShake] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const isSubmitting = status.type === "submitting";
  const selectedColor = colors.find((color) => color.id === form.colorId);

  function updateField<K extends keyof ClientFormValues>(field: K, value: ClientFormValues[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function focusFirstInvalidField(errors: ClientFormErrors) {
    const order: (keyof ClientFormValues)[] = ["fullName", "email", "cpf", "colorId", "notes"];
    const firstField = order.find((field) => errors[field]);
    if (!firstField) return;

    if (firstField === "colorId") {
      formRef.current?.querySelector<HTMLElement>("#colorId")?.focus();
    } else {
      formRef.current?.querySelector<HTMLElement>(`#${firstField}`)?.focus();
    }
  }

  function triggerShake() {
    setShake(true);
    window.setTimeout(() => setShake(false), 400);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const errors = validateClientForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStatus({ type: "idle" });
      triggerShake();
      focusFirstInvalidField(errors);
      return;
    }

    setFieldErrors({});
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
      triggerShake();
    }
  }

  if (status.type === "success") {
    return (
      <div className="result-card success card-pop" role="status">
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
            <span className="color-dot" style={{ backgroundColor: selectedColor.hexCode }} />
            Cor preferida: <strong>{selectedColor.name}</strong>
          </div>
        )}
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setForm(initialState);
            setFieldErrors({});
            setStatus({ type: "idle" });
          }}
        >
          Cadastrar outro cliente
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className={shake ? "shake" : undefined}
    >
      <div className="field-grid">
        <div className="field">
          <label htmlFor="fullName">
            Nome completo <span className="required-mark">*</span>
          </label>
          <input
            id="fullName"
            value={form.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(fieldErrors.fullName)}
            aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
            className={fieldErrors.fullName ? "invalid" : undefined}
          />
          {fieldErrors.fullName && (
            <span className="field-error" id="fullName-error">
              {fieldErrors.fullName}
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="email">
            E-mail <span className="required-mark">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className={fieldErrors.email ? "invalid" : undefined}
          />
          {fieldErrors.email && (
            <span className="field-error" id="email-error">
              {fieldErrors.email}
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="cpf">
            CPF <span className="required-mark">*</span>
          </label>
          <input
            id="cpf"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={form.cpf}
            onChange={(e) => updateField("cpf", maskCpf(e.target.value))}
            disabled={isSubmitting}
            aria-invalid={Boolean(fieldErrors.cpf)}
            aria-describedby={fieldErrors.cpf ? "cpf-error" : undefined}
            className={fieldErrors.cpf ? "invalid" : undefined}
          />
          {fieldErrors.cpf && (
            <span className="field-error" id="cpf-error">
              {fieldErrors.cpf}
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="colorId">
            Cor preferida <span className="required-mark">*</span>
          </label>
          <ColorSelect
            id="colorId"
            colors={colors}
            value={form.colorId}
            onChange={(colorId) => updateField("colorId", colorId)}
            disabled={isSubmitting}
            isLoading={isLoadingColors}
            invalid={Boolean(fieldErrors.colorId)}
            describedBy={fieldErrors.colorId ? "colorId-error" : undefined}
          />
          {fieldErrors.colorId && (
            <span className="field-error" id="colorId-error">
              {fieldErrors.colorId}
            </span>
          )}
        </div>

        <div className="field field-full">
          <label htmlFor="notes">Observações</label>
          <textarea
            id="notes"
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            disabled={isSubmitting}
            className={fieldErrors.notes ? "invalid" : undefined}
          />
          {fieldErrors.notes && <span className="field-error">{fieldErrors.notes}</span>}
        </div>
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
