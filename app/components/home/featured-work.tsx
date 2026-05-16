"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger, SplitText } from "gsap/all";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "../shaders/shaders";
import { work } from "@/app/data/work";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const FeaturedWork = () => {
  const sectionRef = useRef<HTMLDivElement>(null); // outer pinned section
  const sliderRef = useRef<HTMLDivElement>(null); // inner canvas / content container

  useGSAP(
    () => {
      let currentIndex = 0;
      let isTransitioning = false;
      let rippleTween: gsap.core.Tween | null = null;

      const section = sectionRef.current;
      const slider = sliderRef.current;
      if (!section || !slider) return;

      // ── Text split helpers ────────────────────────────────────────
      function splitTitle(container: Element | null) {
        if (!container) return null;
        const heading = container.querySelector(".slide-title h1");
        if (!heading) return null;
        return SplitText.create(heading, {
          type: "words, chars",
          mask: "chars",
          wordsClass: "word",
          charsClass: "char",
        });
      }

      function splitDescription(container: Element | null): Element[] {
        if (!container) return [];
        const paragraphs = container.querySelectorAll(".slide-description p");
        const allLines: Element[] = [];
        paragraphs.forEach((p) => {
          const split = SplitText.create(p, {
            type: "lines",
            mask: "lines",
            linesClass: "line",
          });
          allLines.push(...split.lines);
        });
        return allLines;
      }

      function buildSlideContent(slide: (typeof work)[number]) {
        const el = document.createElement("div");
        el.className = "slide-content";
        el.style.opacity = "0";
        el.innerHTML = `
          <div class="slide-title title"><h1>${slide.title}</h1></div>
          <div class="slide-description"><p>${slide.description}</p></div>
        `;
        return el;
      }

      function animateTextIn(container: Element) {
        const titleSplit = splitTitle(container);
        const lines = splitDescription(container);
        const chars = titleSplit ? titleSplit.chars : [];

        gsap.set([chars, lines], { y: "100%" });
        gsap.set(container, { opacity: 1 });

        return gsap
          .timeline()
          .to(chars, { y: "0%", ease: "power2.inOut", duration: 0.5 })
          .to(
            lines,
            { y: "0%", stagger: 0.05, ease: "power2.inOut", duration: 0.5 },
            0.1,
          );
      }

      function animateTextOut(container: Element | null): Promise<void> {
        if (!container) return Promise.resolve();
        const titleSplit = splitTitle(container);
        const lines = splitDescription(container);
        const chars = titleSplit ? titleSplit.chars : [];

        return gsap
          .timeline()
          .to(chars, {
            y: "-100%",
            opacity: 0,
            ease: "power2.in",
            duration: 0.35,
          })
          .to(
            lines,
            {
              y: "-100%",
              opacity: 0,
              stagger: 0.04,
              ease: "power2.in",
              duration: 0.35,
            },
            0,
          )
          .then();
      }

      // ── Three.js setup ────────────────────────────────────────────
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(
        -0.5,
        0.5,
        0.5,
        -0.5,
        0.01,
        10,
      );
      camera.position.z = 1;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
      renderer.setClearColor(0x000000, 0);
      slider.prepend(renderer.domElement);

      // ── Load textures ─────────────────────────────────────────────
      const textureLoader = new THREE.TextureLoader();
      const texturePromises: Promise<THREE.Texture>[] = work.map(
        (slide) =>
          new Promise<THREE.Texture>((resolve) => {
            textureLoader.load(slide.image, (tex) => {
              tex.minFilter = THREE.LinearFilter;
              tex.magFilter = THREE.LinearFilter;
              tex.wrapS = THREE.ClampToEdgeWrapping;
              tex.wrapT = THREE.ClampToEdgeWrapping;
              resolve(tex);
            });
          }),
      );

      const rippleConfig = {
        waveFreq: 25,
        wavePower: 0.035,
        waveWidth: 0.5,
        falloff: 10.0,
        boostStrength: 0.5,
        crossfadeWidth: 0.05,
        duration: 3.0,
        endValue: 1.0,
        ease: "power2.out",
      };

      // ── Init after textures resolve ───────────────────────────────
      Promise.all(texturePromises).then((resolvedTextures) => {
        const uniforms = {
          uTexCurrent: { value: resolvedTextures[0] },
          uTexNext: { value: resolvedTextures[1] ?? resolvedTextures[0] },
          uProgress: { value: 0.0 },
          uResolution: { value: new THREE.Vector2() },
          uImageRes: { value: new THREE.Vector2(1920, 1280) },
          uWaveFreq: { value: rippleConfig.waveFreq },
          uWavePow: { value: rippleConfig.wavePower },
          uWaveWidth: { value: rippleConfig.waveWidth },
          uFalloff: { value: rippleConfig.falloff },
          uBoostStrength: { value: rippleConfig.boostStrength },
          uCrossfadeWidth: { value: rippleConfig.crossfadeWidth },
          uMobile: { value: window.innerWidth <= 768 ? 1.0 : 0.0 },
        };

        const material = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms,
          transparent: true,
        });

        const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
        scene.add(plane);

        function getMaxCornerDist() {
          const ratio = window.innerHeight / window.innerWidth;
          return Math.sqrt(0.25 + (0.5 * ratio) ** 2);
        }

        function handleResize() {
          const width = slider.clientWidth || 0;
          const height = slider.clientHeight || 0;
          renderer.setSize(width, height);
          uniforms.uResolution.value.set(width, height);
          uniforms.uMobile.value = window.innerWidth <= 768 ? 1.0 : 0.0;
          rippleConfig.endValue = getMaxCornerDist() + rippleConfig.waveWidth;
          rippleConfig.duration = window.innerWidth <= 768 ? 1.5 : 3.0;
          ScrollTrigger.refresh();
        }

        window.addEventListener("resize", handleResize);
        handleResize();

        // ── Animate initial slide in ──────────────────────────────
        const initialSlide = slider.querySelector(".slide-content");
        const initialTitleSplit = splitTitle(initialSlide);
        const initialLines = splitDescription(initialSlide);

        if (initialTitleSplit) {
          gsap.fromTo(
            initialTitleSplit.chars,
            { y: "100%" },
            { y: "0%", duration: 0.8, stagger: 0.025, ease: "power2.out" },
          );
        }
        if (initialLines.length) {
          gsap.fromTo(
            initialLines,
            { y: "100%" },
            {
              y: "0%",
              duration: 0.8,
              stagger: 0.025,
              ease: "power2.out",
              delay: 0.2,
            },
          );
        }

        // ── Core transition fn ────────────────────────────────────
        function goToSlide(nextIndex: number) {
          if (isTransitioning) return;
          if (nextIndex === currentIndex) return;

          isTransitioning = true;

          if (rippleTween) {
            rippleTween.kill();
            uniforms.uProgress.value = 0.0;
            rippleTween = null;
          }

          const currentSlide = slider.querySelector(".slide-content");
          const exitPromise = animateTextOut(currentSlide);

          uniforms.uTexCurrent.value = resolvedTextures[currentIndex];
          uniforms.uTexNext.value = resolvedTextures[nextIndex];
          uniforms.uProgress.value = 0.0;

          let unlocked = false;

          rippleTween = gsap.to(uniforms.uProgress, {
            value: rippleConfig.endValue,
            duration: rippleConfig.duration,
            ease: rippleConfig.ease,
            delay: 0.3,
            onUpdate: () => {
              if (!unlocked && uniforms.uProgress.value > 0.7) {
                unlocked = true;
                currentIndex = nextIndex;
                isTransitioning = false;
              }
            },
            onComplete: () => {
              uniforms.uTexCurrent.value = resolvedTextures[currentIndex];
              uniforms.uProgress.value = 0.0;
              rippleTween = null;
              if (!unlocked) {
                currentIndex = nextIndex;
                isTransitioning = false;
              }
            },
          });

          exitPromise.then(() => {
            currentSlide?.remove();
            const nextSlide = buildSlideContent(work[nextIndex]);
            slider.appendChild(nextSlide);
            requestAnimationFrame(() => animateTextIn(nextSlide));
          });
        }

        // ── ScrollTrigger — pin + snap, one segment per slide ────
        //
        // The section is pinned for (work.length - 1) × 100vh of scroll.
        // snap divides that into equal segments. onUpdate converts the
        // current progress → a slide index and fires goToSlide.
        //
        const totalSlides = work.length;

        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${(totalSlides - 1) * window.innerHeight}`,
          pin: true,
          pinSpacing: true,
          snap: {
            snapTo: 1 / (totalSlides - 1),
            duration: { min: 0.3, max: 0.6 },
            delay: 0.05,
            ease: "power2.inOut",
          },
          onUpdate: (self) => {
            const snappedIndex = Math.round(self.progress * (totalSlides - 1));
            if (snappedIndex !== currentIndex && !isTransitioning) {
              goToSlide(snappedIndex);
            }
          },
        });

        // ── Render loop ───────────────────────────────────────────
        let animFrameId: number;
        function render() {
          renderer.render(scene, camera);
          animFrameId = requestAnimationFrame(render);
        }
        render();

        // ── Cleanup ───────────────────────────────────────────────
        return () => {
          window.removeEventListener("resize", handleResize);
          cancelAnimationFrame(animFrameId);
          renderer.dispose();
          material.dispose();
          plane.geometry.dispose();
          resolvedTextures.forEach((t) => t.dispose());
        };
      });
    },
    { scope: sectionRef },
  );

  return (
    <div ref={sectionRef} className="w-full h-screen">
      <div ref={sliderRef} className="featured-work-slider">
        <div className="slide-content">
          <div className="slide-title title">
            <h1>{work[0].title}</h1>
          </div>
          <div className="slide-description">
            <p>{work[0].description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedWork;
