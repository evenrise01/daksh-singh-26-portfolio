"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLenis } from "lenis/react";

interface PreloaderProps {
  onComplete: () => void;
}

/**
 * Full-screen intro animation.
 * Only rendered on the homepage when introSeen is not set.
 * Locks scroll while running, releases + calls onComplete when done.
 */
export default function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      lenis?.stop();

      const tl = gsap.timeline({
        onComplete: () => {
          lenis?.start();
          onComplete();
        },
      });

      // ── Animate in ─────────────────────────────────────────────
      // Counter ticks 0 → 100
      tl.to(".preloader-counter", {
        innerText: 100,
        snap: { innerText: 1 },
        duration: 1.6,
        ease: "power2.inOut",
      })
        // Progress bar fills
        .to(
          ".preloader-bar",
          {
            scaleX: 1,
            duration: 1.6,
            ease: "power2.inOut",
          },
          "<",
        )
        // Short pause at 100%
        .to({}, { duration: 0.3 })
        // Slide the whole preloader upward off screen
        .to(containerRef.current, {
          yPercent: -100,
          duration: 0.9,
          ease: "expo.inOut",
        });
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="preloader-overlay fixed inset-0 z-[--z-index-loader] flex flex-col items-center justify-center bg-[--brand-black]"
    >
      <div className="preloader"></div>
    </div>
  );
}
