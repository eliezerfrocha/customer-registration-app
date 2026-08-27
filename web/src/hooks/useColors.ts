import { useEffect, useState } from "react";
import { fetchColors } from "../services/api";
import { Color } from "../types";

export function useColors() {
  const [colors, setColors] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchColors()
      .then((data) => {
        if (!cancelled) setColors(data);
      })
      .catch(() => {
        if (!cancelled) setError("Não foi possível carregar as cores disponíveis.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { colors, isLoading, error };
}
