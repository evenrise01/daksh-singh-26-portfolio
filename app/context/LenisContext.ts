import { createContext, useContext } from "react";
import Lenis from "lenis";

export const LenisContext = createContext<React.RefObject<Lenis | null> | null>(null);

export function useLenis() {
  const ctx = useContext(LenisContext);
  if (!ctx) throw new Error("useLenis must be used inside LenisProvider");
  return ctx;
}