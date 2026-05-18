"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { useLenis } from "lenis/react";
import { CustomEase } from "gsap/all";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(CustomEase);
CustomEase.create("hop", "0.9, 0, 0.1, 1");
/**
 * Call this once at the top of every page component.
 * Sweeps the curtain upward to reveal the new page,
 * then restores scroll.
 *
 * Usage:
 *   export default function WorkPage() {
 *     usePageEnter()
 *     return <main>...</main>
 *   }
 */
export function usePageEnter() {
  useGSAP(() => {
    gsap.to(".transition-revealer", {
      scaleY: 0,
      duration: 1.25,
      delay: 1,
      ease: "hop",
    });
  }, {});
}
