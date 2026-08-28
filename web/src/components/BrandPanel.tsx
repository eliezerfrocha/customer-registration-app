import { CSSProperties } from "react";
import { Color } from "../types";

const RAINBOW = ["#E53935", "#FB8C00", "#FDD835", "#43A047", "#1E88E5", "#3949AB", "#8E24AA"];

interface BrandPanelProps {
  color?: Color;
}

export function BrandPanel({ color }: BrandPanelProps) {
  const style = color ? ({ "--brand-color": color.hexCode } as CSSProperties) : undefined;

  return (
    <aside className={`brand-panel${color ? " has-color" : ""}`} style={style}>
      <div className="brand-blob" aria-hidden="true" />
      <div className="brand-content">
        <span className="brand-kicker">Cadastro de cliente</span>
        <h2>Todo cliente tem uma cor.</h2>
        <p>
          {color ? (
            <>
              A sua é <strong>{color.name}</strong>.
            </>
          ) : (
            "Escolha a que mais combina com você no formulário ao lado."
          )}
        </p>
        <div className="brand-swatches" aria-hidden="true">
          {RAINBOW.map((hex) => (
            <span key={hex} className="brand-swatch-dot" style={{ backgroundColor: hex }} />
          ))}
        </div>
      </div>
    </aside>
  );
}
