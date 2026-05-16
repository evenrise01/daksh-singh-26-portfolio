import gsap from "gsap";
import { SplitText } from "gsap/all";

export function useBlockTextReveal() {
  function setupBlockReveal(
    container: Element | null,
    selector: string,
    blockColor: string = "#fefefe",
  ) {
    if (!container) return { lines: [], blocks: [] };
    const elements = container.querySelectorAll(selector);
    const lines: Element[] = [];
    const blocks: HTMLDivElement[] = [];

    elements.forEach((element) => {
      const split = SplitText.create(element, {
        type: "lines",
        linesClass: "block-line",
        lineThreshold: 0.1,
      });

      split.lines.forEach((line) => {
        // Only wrap if not already wrapped
        if (
          line.parentNode &&
          (line.parentNode as Element).classList.contains("block-line-wrapper")
        ) {
          const wrapper = line.parentNode as Element;
          const block = wrapper.querySelector(
            ".block-revealer",
          ) as HTMLDivElement;
          lines.push(line);
          blocks.push(block);
          return;
        }

        const wrapper = document.createElement("div");
        wrapper.className = "block-line-wrapper";
        line.parentNode?.insertBefore(wrapper, line);
        wrapper.appendChild(line);

        const block = document.createElement("div");
        block.className = "block-revealer";
        block.style.backgroundColor = blockColor;
        wrapper.appendChild(block);

        lines.push(line);
        blocks.push(block);
      });
    });

    return { lines, blocks };
  }

  function animateTextIn(
    container: Element,
    titleSelector: string = ".slide-title h1",
    descSelector: string = ".slide-description p",
    options?: { blockColor?: string; duration?: number; stagger?: number },
  ) {
    const {
      duration = 0.75,
      stagger = 0.15,
      blockColor = "#fefefe",
    } = options || {};

    const titleSetup = setupBlockReveal(container, titleSelector, blockColor);
    const descSetup = setupBlockReveal(container, descSelector, blockColor);

    const allLines = [...titleSetup.lines, ...descSetup.lines];
    const allBlocks = [...titleSetup.blocks, ...descSetup.blocks];

    gsap.set(allLines, { opacity: 0 });
    gsap.set(allBlocks, {
      scaleX: 0,
      skewX: -15,
      transformOrigin: "left center",
    });
    gsap.set(container, { opacity: 1 });

    const tl = gsap.timeline();

    allBlocks.forEach((block, index) => {
      const line = allLines[index];
      const blockTl = gsap.timeline();

      blockTl.to(block, {
        scaleX: 1,
        duration: duration,
        ease: "power3.inOut",
      });
      blockTl.set(line, { opacity: 1 });
      blockTl.set(block, { transformOrigin: "right center" });
      blockTl.to(block, {
        scaleX: 0,
        duration: duration,
        ease: "power3.inOut",
      });

      tl.add(blockTl, index * stagger);
    });

    return tl;
  }

  function animateTextOut(
    container: Element | null,
    titleSelector: string = ".slide-title h1",
    descSelector: string = ".slide-description p",
    options?: { duration?: number; stagger?: number },
  ): Promise<void> {
    if (!container) return Promise.resolve();
    const { duration = 0.5, stagger = 0.1 } = options || {};

    const titleSetup = setupBlockReveal(container, titleSelector);
    const descSetup = setupBlockReveal(container, descSelector);

    const allLines = [...titleSetup.lines, ...descSetup.lines];
    const allBlocks = [...titleSetup.blocks, ...descSetup.blocks];

    if (allBlocks.length === 0) return Promise.resolve();

    const tl = gsap.timeline();

    allBlocks.forEach((block, index) => {
      const line = allLines[index];
      const blockTl = gsap.timeline();

      blockTl.set(block, { transformOrigin: "right center" });
      blockTl.to(block, {
        scaleX: 1,
        duration: duration,
        ease: "power3.inOut",
      });
      blockTl.set(line, { opacity: 0 });
      blockTl.set(block, { transformOrigin: "left center" });
      blockTl.to(block, {
        scaleX: 0,
        duration: duration,
        ease: "power3.inOut",
      });

      tl.add(blockTl, index * stagger);
    });

    return tl.then();
  }

  return { setupBlockReveal, animateTextIn, animateTextOut };
}
