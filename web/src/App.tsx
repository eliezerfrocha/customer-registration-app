import { CSSProperties, useState } from "react";
import { ClientRegistrationForm } from "./components/ClientRegistrationForm";
import { Color } from "./types";

export function App() {
  const [previewColor, setPreviewColor] = useState<Color | undefined>(undefined);

  const cardStyle = previewColor
    ? ({ "--accent-color": previewColor.hexCode } as CSSProperties)
    : undefined;

  return (
    <div className="page">
      <main className={`card${previewColor ? " has-accent" : ""}`} style={cardStyle}>
        <h1>Cadastro de Cliente</h1>
        <p className="subtitle">Preencha seus dados abaixo. Leva menos de um minuto.</p>
        <ClientRegistrationForm onColorPreview={setPreviewColor} />
      </main>
    </div>
  );
}
