// app/components/animations/scrollTextReveal.tsx
"use client";
import React, { useRef } from "react";
import gsap from "gsap";
import { SplitText, ScrollTrigger } from "gsap/all";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(SplitText, ScrollTrigger);

type ScrollConfig = {
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
};

export default function ScrollDrivenBlockTextReveal({
  children,
  blockColor,
  stagger,
  duration,
  scrollConfig,
}: {
  children: React.ReactNode;
  blockColor?: string;
  stagger?: number;
  duration?: number;
  scrollConfig?: ScrollConfig;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const splitRefs = useRef<SplitText[]>([]);
  const lines = useRef<Element[]>([]);
  const blocks = useRef<HTMLDivElement[]>([]);

  useGSAP(
    () => {
      if (!containerRef.current || !sectionRef.current) return;
      splitRefs.current = [];
      lines.current = [];
      blocks.current = [];

      let elements: Element[] = [];
      if (containerRef.current.hasAttribute("data-copy-wrapper")) {
        elements = Array.from(containerRef.current.children);
      } else {
        elements = [containerRef.current];
      }

      elements.forEach((element) => {
        const split = SplitText.create(element, {
          type: "lines",
          linesClass: "block-line++",
          lineThreshold: 0.1,
        });
        splitRefs.current.push(split);

        split.lines.forEach((line) => {
          const wrapper = document.createElement("div");
          wrapper.className = "block-line-wrapper";
          line.parentNode?.insertBefore(wrapper, line);
          wrapper.appendChild(line);

          const block = document.createElement("div");
          block.className = "block-revealer";
          block.style.backgroundColor = blockColor ?? "#fefefe";
          wrapper.appendChild(block);

          lines.current.push(line);
          blocks.current.push(block);
        });
      });

      gsap.set(lines.current, { opacity: 0 });
      gsap.set(blocks.current, {
        scaleX: 0,
        skewX: -15,
        transformOrigin: "left center",
      });

      const buildTimeline = (block: HTMLDivElement, line: Element) => {
        const tl = gsap.timeline();
        const dur = duration ?? 0.75;
        tl.to(block, { scaleX: 1, skewX: -15, duration: dur, ease: "power4.inOut" });
        tl.set(line, { opacity: 1 });
        tl.set(block, { transformOrigin: "right center" });
        tl.to(block, { scaleX: 0, skewX: 0, duration: dur, ease: "power4.inOut" });
        return tl;
      };

      const lineCount = blocks.current.length;
      const dur = duration ?? 0.75;
      const staggerVal = stagger ?? 0.15;
      const totalDuration = (lineCount - 1) * staggerVal + dur * 2;
      const scrollDistance = totalDuration * 300;

      const master = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,  // trigger and pin the same wrapper
          pin: true,
          start: scrollConfig?.start ?? "top top",
          end: scrollConfig?.end ?? `+=${scrollDistance}`,
          scrub: scrollConfig?.scrub ?? 1,
          anticipatePin: 1,
          markers: scrollConfig?.markers ?? false,
        },
      });

      blocks.current.forEach((block, index) => {
        master.add(
          buildTimeline(block, lines.current[index]),
          index * staggerVal
        );
      });

      return () => {
        splitRefs.current.forEach((split) => split.revert());
        if (!containerRef.current) return;
        const wrappers = containerRef.current.querySelectorAll(".block-line-wrapper");
        wrappers.forEach((wrapper) => {
          if (wrapper.parentNode && wrapper.firstChild) {
            wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
            wrapper.remove();
          }
        });
      };
    },
    {
      scope: sectionRef,
      dependencies: [duration, stagger, blockColor, scrollConfig],
    }
  );

  // The component owns its own full-viewport section wrapper
  // so pinning always works correctly — no external ref needed
  return (
    <div
      ref={sectionRef}
      className="w-screen h-screen flex items-center justify-center"
    >
      <div ref={containerRef} data-copy-wrapper="true">
        {children}
      </div>
    </div>
  );
}