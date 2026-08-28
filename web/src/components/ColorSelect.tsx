import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { Color } from "../types";
import { ChevronDownIcon } from "./icons";

interface ColorSelectProps {
  id?: string;
  colors: Color[];
  value: string;
  onChange: (colorId: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  invalid?: boolean;
  describedBy?: string;
}

export function ColorSelect({
  id,
  colors,
  value,
  onChange,
  disabled,
  isLoading,
  invalid,
  describedBy,
}: ColorSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedIndex = colors.findIndex((color) => color.id === value);
  const selected = colors[selectedIndex];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
      listRef.current?.focus();
      listRef.current
        ?.querySelector<HTMLElement>('[data-active="true"]')
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, selectedIndex]);

  function openList() {
    if (disabled || isLoading || colors.length === 0) return;
    setIsOpen(true);
  }

  function selectColor(color: Color) {
    onChange(color.id);
    setIsOpen(false);
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      openList();
    }
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, colors.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (colors[activeIndex]) selectColor(colors[activeIndex]);
        break;
      case "Escape":
        event.preventDefault();
        setIsOpen(false);
        break;
    }
  }

  return (
    <div className="select-field" ref={rootRef}>
      <button
        type="button"
        id={id}
        className={`select-trigger${invalid ? " invalid" : ""}`}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-required="true"
        aria-invalid={invalid}
        aria-describedby={describedBy}
        disabled={disabled || isLoading}
        onClick={() => (isOpen ? setIsOpen(false) : openList())}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className="select-trigger-value">
          {isLoading ? (
            "Carregando cores..."
          ) : selected ? (
            <>
              <span className="color-dot" style={{ backgroundColor: selected.hexCode }} />
              {selected.name}
            </>
          ) : (
            <span className="select-placeholder">Selecione uma cor</span>
          )}
        </span>
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <ul
          className="select-panel"
          role="listbox"
          tabIndex={-1}
          onKeyDown={handleListKeyDown}
          ref={listRef}
        >
          {colors.map((color, index) => (
            <li
              key={color.id}
              role="option"
              aria-selected={color.id === value}
              data-active={index === activeIndex}
              className={`select-option${index === activeIndex ? " active" : ""}${
                color.id === value ? " selected" : ""
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => selectColor(color)}
            >
              <span className="color-dot" style={{ backgroundColor: color.hexCode }} />
              {color.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
