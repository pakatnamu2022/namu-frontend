import { useCallback, useEffect, useRef, useState } from "react";
import { fetchLoginPhoto, type LoginPhoto } from "../services/unsplash.service";
import { LOGIN } from "@/constants/login";

type Credit = Pick<LoginPhoto, "authorName" | "authorUrl" | "unsplashUrl">;

export interface BgFrame {
  id: number;
  src: string;
  color: string;
  credit: Credit | null;
}

interface State {
  /** Frame actual a mostrar. null hasta que carga la primera imagen. */
  frame: BgFrame | null;
  /** true mientras se pide/carga una imagen nueva. */
  busy: boolean;
  /** Pide otra foto aleatoria (ignora la cache del día). */
  refresh: () => void;
}

const DARK = "#1E2430";

function preload(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

export function useLoginBackground(): State {
  const [frame, setFrame] = useState<BgFrame | null>(null);
  const [busy, setBusy] = useState(true);
  const idRef = useRef(0);
  const aliveRef = useRef(true);

  const load = useCallback(async (force: boolean) => {
    setBusy(true);
    try {
      const photo = await fetchLoginPhoto({ force });
      const next: BgFrame = photo
        ? {
            id: ++idRef.current,
            src: photo.imageUrl,
            color: photo.color,
            credit: {
              authorName: photo.authorName,
              authorUrl: photo.authorUrl,
              unsplashUrl: photo.unsplashUrl,
            },
          }
        : { id: ++idRef.current, src: LOGIN.FONDO, color: DARK, credit: null };
      await preload(next.src);
      if (aliveRef.current) setFrame(next);
    } catch {
      // sin key, rate limit u offline: caemos al fallback local, pero solo
      // si aún no hay nada en pantalla (no pisamos una foto ya cargada).
      if (aliveRef.current)
        setFrame((f) => f ?? { id: ++idRef.current, src: LOGIN.FONDO, color: DARK, credit: null });
    } finally {
      if (aliveRef.current) setBusy(false);
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    load(false);
    return () => {
      aliveRef.current = false;
    };
  }, [load]);

  return { frame, busy, refresh: () => load(true) };
}
