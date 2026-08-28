import { CSSProperties } from "react";
import { Color } from "../types";

interface ColorPickerProps {
  colors: Color[];
  value: string;
  onChange: (colorId: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ColorPicker({ colors, value, onChange, disabled, isLoading }: ColorPickerProps) {
  const selected = colors.find((color) => color.id === value);

  if (isLoading) {
    return <div className="color-grid-placeholder">Carregando cores...</div>;
  }

  return (
    <div>
      <div className="color-grid" role="radiogroup" aria-label="Cor preferida">
        {colors.map((color) => {
          const isSelected = color.id === value;
          return (
            <label
              key={color.id}
              className={`color-swatch${isSelected ? " selected" : ""}`}
              style={{ "--swatch-color": color.hexCode } as CSSProperties}
            >
              <input
                type="radio"
                name="colorId"
                value={color.id}
                checked={isSelected}
                onChange={() => onChange(color.id)}
                disabled={disabled}
                required
              />
              <span className="color-swatch-dot" aria-hidden="true" />
              <span className="color-swatch-name">{color.name}</span>
            </label>
          );
        })}
      </div>

      <div className={`color-preview${selected ? " visible" : ""}`} aria-live="polite">
        {selected && (
          <>
            <span className="color-preview-dot" style={{ backgroundColor: selected.hexCode }} />
            Cor selecionada: <strong>{selected.name}</strong>
          </>
        )}
      </div>
    </div>
  );
}
