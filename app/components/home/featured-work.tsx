"use client";

import React, { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger, SplitText } from "gsap/all";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "../shaders/shaders";
import { work } from "@/app/data/work";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const FeaturedWork = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLUListElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);
  const titleOverlayRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      let currentIndex = 0;
      let isTransitioning = false;
      let rippleTween: gsap.core.Tween | null = null;

      const section = sectionRef.current;
      const slider = sliderRef.current;
      const minimap = minimapRef.current;
      const servicesList = servicesRef.current;
      const indexEl = indexRef.current;
      const titleOverlay = titleOverlayRef.current;

      if (!section || !slider) return;

      // ── Split helpers ─────────────────────────────────────────────
      function splitTitle(container: Element | null) {
        if (!container) return null;
        const heading = container.querySelector("h1");
        if (!heading) return null;
        return SplitText.create(heading, {
          type: "chars",
          mask: "chars",
          charsClass: "char",
        });
      }

      function animateTextIn(container: Element) {
        const split = splitTitle(container);
        const chars = split ? split.chars : [];
        gsap.set(chars, { y: "100%" });
        gsap.set(container, { opacity: 1 });
        return gsap.timeline().to(chars, {
          y: "0%",
          ease: "power2.inOut",
          duration: 0.5,
          stagger: 0.018,
        });
      }

      function animateTextOut(container: Element | null): Promise<void> {
        if (!container) return Promise.resolve();
        const split = splitTitle(container);
        const chars = split ? split.chars : [];
        return gsap
          .timeline()
          .to(chars, {
            y: "-100%",
            opacity: 0,
            ease: "power2.in",
            duration: 0.28,
            stagger: 0.01,
          })
          .then();
      }

      function updateTitleOverlay(idx: number) {
        if (!titleOverlay) return;
        animateTextOut(titleOverlay).then(() => {
          titleOverlay.innerHTML = `<h1>${work[idx].title}</h1>`;
          animateTextIn(titleOverlay);
        });
      }

      // ── Update services ───────────────────────────────────────────
      function updateServices(idx: number) {
        if (!servicesList) return;
        gsap.to(servicesList.querySelectorAll("li"), {
          y: -6,
          opacity: 0,
          duration: 0.18,
          stagger: 0.03,
          ease: "power2.in",
          onComplete: () => {
            servicesList.innerHTML = work[idx].services
              .map((s) => `<li>${s}</li>`)
              .join("");
            gsap.fromTo(
              servicesList.querySelectorAll("li"),
              { y: 8, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.32,
                stagger: 0.05,
                ease: "power2.out",
              },
            );
          },
        });
      }

      // ── Update index counter ──────────────────────────────────────
      function updateIndex(idx: number) {
        if (!indexEl) return;
        gsap.to(indexEl, {
          opacity: 0,
          y: -5,
          duration: 0.14,
          onComplete: () => {
            indexEl.textContent = String(idx + 1).padStart(2, "0");
            gsap.fromTo(
              indexEl,
              { opacity: 0, y: 5 },
              { opacity: 1, y: 0, duration: 0.18, ease: "power2.out" },
            );
          },
        });
      }

      // ── Update minimap ────────────────────────────────────────────
      function updateMinimap(idx: number) {
        minimap
          ?.querySelectorAll<HTMLElement>(".minimap-thumb")
          .forEach((t, i) => t.classList.toggle("active", i === idx));
      }

      // ── Three.js ──────────────────────────────────────────────────
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
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      slider.prepend(renderer.domElement);

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
          const w = slider.clientWidth || 0;
          const h = slider.clientHeight || 0;
          renderer.setSize(w, h);
          uniforms.uResolution.value.set(w, h);
          uniforms.uMobile.value = window.innerWidth <= 768 ? 1.0 : 0.0;
          rippleConfig.endValue = getMaxCornerDist() + rippleConfig.waveWidth;
          rippleConfig.duration = window.innerWidth <= 768 ? 1.5 : 3.0;
          ScrollTrigger.refresh();
        }

        window.addEventListener("resize", handleResize);
        handleResize();

        // ── Initial state ─────────────────────────────────────────
        if (titleOverlay) {
          titleOverlay.innerHTML = `<h1>${work[0].title}</h1>`;
          const split = splitTitle(titleOverlay);
          if (split) {
            gsap.fromTo(
              split.chars,
              { y: "100%" },
              {
                y: "0%",
                duration: 0.8,
                stagger: 0.022,
                ease: "power2.out",
                delay: 0.3,
              },
            );
          }
        }
        updateMinimap(0);
        updateIndex(0);

        // ── goToSlide ─────────────────────────────────────────────
        function goToSlide(nextIndex: number) {
          if (isTransitioning || nextIndex === currentIndex) return;
          if (nextIndex < 0 || nextIndex >= work.length) return;

          isTransitioning = true;

          if (rippleTween) {
            rippleTween.kill();
            uniforms.uProgress.value = 0.0;
            rippleTween = null;
          }

          uniforms.uTexCurrent.value = resolvedTextures[currentIndex];
          uniforms.uTexNext.value = resolvedTextures[nextIndex];
          uniforms.uProgress.value = 0.0;

          updateMinimap(nextIndex);
          updateServices(nextIndex);
          updateIndex(nextIndex);
          updateTitleOverlay(nextIndex);

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
        }

        minimap
          ?.querySelectorAll<HTMLElement>(".minimap-thumb")
          .forEach((thumb, i) => {
            thumb.addEventListener("click", () => goToSlide(i));
          });

        // ── ScrollTrigger ─────────────────────────────────────────
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
    <div ref={sectionRef} className="fw-section w-full h-screen relative">
      <div className="fw-layout grid-w h-full items-center">
        {/* ── Col 1: index label + title stacked in the same column ── */}
        <div className="fw-index-col col-span-1 self-center max-xl:hidden">
          {/* Index label */}
          <div className="flex items-center gap-2 meta fw-index-label">
            <span ref={indexRef} className="tabular-nums">
              01
            </span>
            <span
              className="inline-block h-px bg-current"
              style={{ width: "2rem" }}
            />
            <span>Featured work</span>
          </div>
        </div>

        {/* Title — sits directly below the label, overflows right into canvas */}
        <div
          ref={titleOverlayRef}
          className="fw-title-overlay col-start-2 z-3 ml-10!"
        />

        {/* ── Col 3–9: canvas ─────────────────────────────────────── */}
        <div
          ref={sliderRef}
          className="fw-canvas col-start-3 col-end-10 relative"
        />

        {/* ── Col 10–11: services list ─────────────────────────────── */}
        <div className="fw-services-col col-start-10 col-end-12 col-span-2 self-center max-md:hidden">
          <ul ref={servicesRef} className="fw-services">
            {work[0].services.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>

        {/* ── Col 12: minimap ──────────────────────────────────────── */}
        <div className="fw-minimap-col col-start-12 col-span-1 self-center max-md:hidden flex justify-end">
          <div ref={minimapRef} className="fw-minimap">
            {work.map((slide) => (
              <button
                key={slide.href}
                className="minimap-thumb"
                aria-label={`Go to ${slide.title}`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="minimap-img"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── View all projects ─────────────────────────────────────── */}
      <div className="fw-viewall">
        <Link href="/works" className="fw-viewall-btn meta">
          VIEW ALL PROJECTS →
        </Link>
      </div>
    </div>
  );
};

export default FeaturedWork;
