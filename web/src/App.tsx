import { useState } from "react";
import { BrandPanel } from "./components/BrandPanel";
import { ClientRegistrationForm } from "./components/ClientRegistrationForm";
import { Color } from "./types";

export function App() {
  const [previewColor, setPreviewColor] = useState<Color | undefined>(undefined);

  return (
    <div className="split-layout">
      <BrandPanel color={previewColor} />
      <div className="form-panel">
        <main className="card">
          <h1>Cadastro de Cliente</h1>
          <p className="subtitle">Preencha seus dados abaixo. Leva menos de um minuto.</p>
          <ClientRegistrationForm onColorPreview={setPreviewColor} />
        </main>
      </div>
    </div>
  );
}
