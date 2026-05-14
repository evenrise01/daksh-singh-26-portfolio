"use client";
import React, { useRef } from "react";

import gsap from "gsap";
import { SplitText, ScrollTrigger } from "gsap/all";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(SplitText, ScrollTrigger);

export default function BlockTextReveal({
  children,
  animateOnScroll,
  delay,
  blockColor,
  stagger,
  duration,
}: {
  children: React.ReactNode;
  animateOnScroll?: boolean; // was `true` — literal type, not a type annotation
  delay?: number; // was `0`
  blockColor?: string; // was `"#000"`
  stagger?: number; // was `0.15`
  duration?: number; // was `0.75`
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const splitRefs = useRef<SplitText[]>([]); // was useRef([]) → inferred never[]
  const lines = useRef<Element[]>([]); // was useRef([]) → inferred never[]
  const blocks = useRef<HTMLDivElement[]>([]); // was useRef([]) → inferred never[]

  useGSAP(
    () => {
      if (!containerRef.current) return;
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
          block.style.backgroundColor = blockColor ?? "#fefefe"; // was `blockColor` — possibly undefined
          wrapper.appendChild(block);

          lines.current.push(line);
          blocks.current.push(block);
        });
      });

      gsap.set(lines.current, { opacity: 0 });
      gsap.set(blocks.current, { scaleX: 0,skewX:-15, transformOrigin: "left center" });

      // Explicit types on all three params — were implicitly `any`
      const createBlockRevealAnimation = (
        block: HTMLDivElement,
        line: Element,
        index: number,
      ) => {
        const tl = gsap.timeline({
          delay: (delay ?? 0) + index * (stagger ?? 0.15),
        }); // guarded — both were possibly undefined

        tl.to(block, {
          scaleX: 1,
          duration: duration ?? 0.75,
          ease: "power3.inOut",
        });
        tl.set(line, { opacity: 1 });
        tl.set(block, { transformOrigin: "right center" });
        tl.to(block, {
          scaleX: 0,
          duration: duration ?? 0.75,
          ease: "power3.inOut",
        });

        return tl;
      };

      if (animateOnScroll) {
        blocks.current.forEach((block, index) => {
          const tl = createBlockRevealAnimation(
            block,
            lines.current[index],
            index,
          );
          tl.pause();

          ScrollTrigger.create({
            trigger: containerRef.current, // was a semicolon — syntax error inside object literal
            start: "top 90%",
            once: true,
            onEnter: () => tl.play(),
          });
        });
      } else {
        blocks.current.forEach((block, index) => {
          createBlockRevealAnimation(block, lines.current[index], index);
        });
      }

      return () => {
        splitRefs.current.forEach((split) => split.revert());

        // Null-guarded — containerRef.current is possibly null inside the cleanup callback
        const container = containerRef.current;
        if (!container) return;

        const wrappers = container.querySelectorAll(".block-line-wrapper");
        wrappers.forEach((wrapper) => {
          if (wrapper.parentNode && wrapper.firstChild) {
            wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
            wrapper.remove();
          }
        });
      };
    },
    {
      scope: containerRef,
      dependencies: [animateOnScroll, delay, duration, stagger, blockColor],
    },
  );

  return (
    <div ref={containerRef} data-copy-wrapper="true">
      {children}
    </div>
  );
}
