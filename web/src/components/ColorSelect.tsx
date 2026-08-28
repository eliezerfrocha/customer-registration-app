import { CSSProperties, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = colors.find((color) => color.id === value);

  const filteredColors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return colors;
    return colors.filter((color) => color.name.toLowerCase().includes(normalizedQuery));
  }, [colors, query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        rootRef.current &&
        !rootRef.current.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPanelStyle({
        position: "fixed",
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    }

    updatePosition();
    setQuery("");
    const initialIndex = colors.findIndex((color) => color.id === value);
    setActiveIndex(initialIndex >= 0 ? initialIndex : 0);
    searchRef.current?.focus();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
    panelRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [query]);

  function openList() {
    if (disabled || isLoading || colors.length === 0) return;
    setIsOpen(true);
  }

  function closeList() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function selectColor(color: Color) {
    onChange(color.id);
    closeList();
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      openList();
    }
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filteredColors.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        event.preventDefault();
        if (filteredColors[activeIndex]) selectColor(filteredColors[activeIndex]);
        break;
      case "Escape":
        event.preventDefault();
        closeList();
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  }

  return (
    <div className="select-field" ref={rootRef}>
      <button
        type="button"
        id={id}
        ref={triggerRef}
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

      {isOpen &&
        createPortal(
          <div className="select-panel" style={panelStyle} ref={panelRef}>
            <input
              ref={searchRef}
              type="text"
              className="select-search"
              placeholder="Buscar cor..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              aria-label="Buscar cor"
              autoComplete="off"
            />
            <ul className="select-options" role="listbox">
              {filteredColors.length === 0 ? (
                <li className="select-empty">Nenhuma cor encontrada.</li>
              ) : (
                filteredColors.map((color, index) => (
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
                ))
              )}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}
