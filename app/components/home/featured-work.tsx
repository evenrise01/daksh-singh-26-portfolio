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
  // ── Desktop refs ──────────────────────────────────────────────
  const desktopRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLUListElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);
  const titleOverlayRef = useRef<HTMLDivElement>(null);

  // ── Mobile refs ───────────────────────────────────────────────
  const mobileRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const prevBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  // ════════════════════════════════════════════════════════════════
  // DESKTOP GSAP — Three.js + ScrollTrigger, scoped to desktopRef
  // ════════════════════════════════════════════════════════════════
  useGSAP(
    () => {
      let currentIndex = 0;
      let isTransitioning = false;
      let rippleTween: gsap.core.Tween | null = null;

      const desktop = desktopRef.current;
      const slider = sliderRef.current;
      const minimap = minimapRef.current;
      const servicesList = servicesRef.current;
      const indexEl = indexRef.current;
      const titleOverlay = titleOverlayRef.current;

      if (!desktop || !slider) return;

      function splitTitle(container: Element | null) {
        if (!container) return null;
        const h = container.querySelector("h1");
        if (!h) return null;
        return SplitText.create(h, {
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

      function updateMinimap(idx: number) {
        minimap
          ?.querySelectorAll<HTMLElement>(".minimap-thumb")
          .forEach((t, i) => t.classList.toggle("active", i === idx));
      }

      function updateDesktopServices(idx: number) {
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

      // Three.js
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
      const texturePromises = work.map(
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
          uMobile: { value: 0.0 },
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
          const w = slider.clientWidth || 0,
            h = slider.clientHeight || 0;
          renderer.setSize(w, h);
          uniforms.uResolution.value.set(w, h);
          rippleConfig.endValue = getMaxCornerDist() + rippleConfig.waveWidth;
          ScrollTrigger.refresh();
        }

        window.addEventListener("resize", handleResize);
        handleResize();

        if (titleOverlay) {
          titleOverlay.innerHTML = `<h1>${work[0].title}</h1>`;
          ScrollTrigger.create({
            trigger: desktop,
            start: "top 75%",
            once: true,
            onEnter: () => {
              gsap.set(titleOverlay, { opacity: 1 });
              const split = splitTitle(titleOverlay);
              if (split)
                gsap.fromTo(
                  split.chars,
                  { y: "100%" },
                  {
                    y: "0%",
                    duration: 0.8,
                    stagger: 0.022,
                    ease: "power2.out",
                  },
                );
            },
          });
        }
        updateMinimap(0);
        updateIndex(0);

        const canvasLink =
          slider.querySelector<HTMLAnchorElement>("#fw-canvas-link");
        if (canvasLink) {
          canvasLink.href = work[0].href || "#";
          canvasLink.style.pointerEvents = work[0].href ? "auto" : "none";
        }

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
          updateDesktopServices(nextIndex);
          updateIndex(nextIndex);
          if (titleOverlay) {
            animateTextOut(titleOverlay).then(() => {
              titleOverlay.innerHTML = `<h1>${work[nextIndex].title}</h1>`;
              animateTextIn(titleOverlay);
            });
          }
          if (canvasLink) {
            canvasLink.href = work[nextIndex].href || "#";
            canvasLink.style.pointerEvents = work[nextIndex].href
              ? "auto"
              : "none";
          }
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

        ScrollTrigger.create({
          trigger: desktop,
          start: "top top",
          end: () => `+=${(work.length - 1) * window.innerHeight}`,
          pin: true,
          pinSpacing: true,
          snap: {
            snapTo: 1 / (work.length - 1),
            duration: { min: 0.3, max: 0.6 },
            delay: 0.05,
            ease: "power2.inOut",
          },
          onUpdate: (self) => {
            const snappedIndex = Math.round(self.progress * (work.length - 1));
            if (snappedIndex !== currentIndex && !isTransitioning)
              goToSlide(snappedIndex);
          },
        });

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
    { scope: desktopRef },
  );

  // ════════════════════════════════════════════════════════════════
  // MOBILE GSAP — track translate + aria toggles, scoped to mobileRef
  // fromanother drives the track with inline transform: translate3d
  // ════════════════════════════════════════════════════════════════
  useGSAP(
    () => {
      let currentIndex = 0;
      let isTransitioning = false;

      const mobile = mobileRef.current;
      const track = trackRef.current;
      const prevBtn = prevBtnRef.current;
      const nextBtn = nextBtnRef.current;

      if (!mobile || !track) return;

      // Measure one slide width (first .image-slide)
      function getSlideWidth(): number {
        const slide = track.querySelector<HTMLElement>(".image-slide");
        if (!slide) return window.innerWidth;
        return slide.getBoundingClientRect().width;
      }

      function getSlideGap(): number {
        // gap is applied as margin-left on non-first slides
        const slides = track.querySelectorAll<HTMLElement>(".image-slide");
        if (slides.length < 2) return 0;
        const style = getComputedStyle(slides[1]);
        return parseFloat(style.marginLeft) || 0;
      }

      // Slide track using translate3d — matches fromanother's inline style approach
      function slideTrack(idx: number) {
        const w = getSlideWidth();
        const g = getSlideGap();
        const offset = -(idx * (w + g));
        track.style.transform = `translate3d(${offset}px, 0px, 0px)`;
      }

      function updateProgressItems(idx: number) {
        mobile
          .querySelectorAll<HTMLElement>(".progress-item")
          .forEach((t, i) =>
            t.setAttribute("aria-current", i === idx ? "true" : "false"),
          );
      }

      // CSS transition handles show/hide — just toggle the active class
      function updateTitles(idx: number) {
        mobile
          .querySelectorAll<HTMLElement>(".contents-title")
          .forEach((el, i) => {
            const isActive = i === idx;
            el.setAttribute("aria-hidden", isActive ? "false" : "true");
            el.classList.toggle("contents-title-active", isActive);
          });
      }

      function updateServices(idx: number) {
        mobile
          .querySelectorAll<HTMLElement>(".contents-services")
          .forEach((el, i) => {
            const isActive = i === idx;
            el.setAttribute("aria-hidden", isActive ? "false" : "true");
            el.classList.toggle("contents-services-active", isActive);
          });
      }

      function updateButtons(idx: number) {
        if (prevBtn) prevBtn.disabled = idx === 0;
        if (nextBtn) nextBtn.disabled = idx === work.length - 1;
      }

      function goToSlide(nextIndex: number) {
        if (isTransitioning || nextIndex === currentIndex) return;
        if (nextIndex < 0 || nextIndex >= work.length) return;
        isTransitioning = true;
        currentIndex = nextIndex;
        slideTrack(nextIndex);
        updateTitles(nextIndex);
        updateServices(nextIndex);
        updateProgressItems(nextIndex);
        updateButtons(nextIndex);
        // match the CSS transition duration (1.4s)
        setTimeout(() => {
          isTransitioning = false;
        }, 1400);
      }

      prevBtn?.addEventListener("click", () => goToSlide(currentIndex - 1));
      nextBtn?.addEventListener("click", () => goToSlide(currentIndex + 1));
      mobile
        .querySelectorAll<HTMLElement>(".progress-item")
        .forEach((btn, i) => {
          btn.addEventListener("click", () => goToSlide(i));
        });

      // Init
      updateProgressItems(0);
      updateTitles(0);
      updateServices(0);
      updateButtons(0);
      slideTrack(0);
    },
    { scope: mobileRef },
  );

  return (
    <>
      {/* ════════════════════════════════════════════════════════
          DESKTOP — pinned by ScrollTrigger
          ════════════════════════════════════════════════════════ */}
      <div
        ref={desktopRef}
        className="fw-desktop fw-section w-full h-screen relative"
      >
        <div className="fw-layout grid-w h-full items-center">
          
          <div className="fw-index-col col-span-1 self-center">
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
          <div
            ref={titleOverlayRef}
            className="fw-title-overlay col-start-2 z-20 md:ml-16! lg:ml-20! xl:ml-24!"
          />
          <div
            ref={sliderRef}
            className="fw-canvas col-start-3 col-end-10 relative"
          >
            <a
              id="fw-canvas-link"
              href="#"
              className="absolute inset-0 block"
              aria-label="View project"
            />
          </div>
          <div className="fw-services-col col-start-10 col-end-12 self-center">
            <ul ref={servicesRef} className="fw-services">
              {work[0].services.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="col-start-12 col-span-1 self-center flex justify-end">
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
        <div className="fw-viewall fw-viewall-desktop">
          <Link href="/works" className="fw-viewall-btn meta">
            VIEW ALL PROJECTS →
          </Link>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          MOBILE — fromanother structure, never pinned
          ════════════════════════════════════════════════════════ */}
      <div ref={mobileRef} className="showcase-mobile">
        <div className="showcase-mobile-content">
          {/* TOP: ghost spacer + progress strip ───────────────── */}
          <div className="showcase-mobile-top">
            <div className="section-index-ghost" aria-hidden="true" />

            <div className="progress">
              <div className="progress-items">
                {work.map((slide, i) => (
                  <div key={slide.href} className="progress-item-wrapper">
                    <button
                      type="button"
                      className="progress-item"
                      aria-label={`Go to project ${i + 1}`}
                      aria-current={i === 0 ? "true" : "false"}
                    >
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="progress-item-img"
                      />
                    </button>
                    <div className="progress-line-ghost" aria-hidden="true" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER: sliding image track ───────────────────────── */}
          <div className="showcase-mobile-center">
            <div className="images-wrap">
              {/*
                track: transform driven by JS as translate3d(Xpx,0,0)
                matching fromanother's inline style pattern exactly
              */}
              <div className="images-track" ref={trackRef}>
                {work.map((slide) => (
                  <div key={slide.href} className="image-slide">
                    <a className="image-link" href={slide.href || "#"}>
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="image-fill"
                      />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BOTTOM: stacked titles + services + pagination ────── */}
          <div className="showcase-mobile-bottom">
            {/*
              contents: all titles/services in DOM simultaneously.
              CSS grid-area + opacity/visibility toggles show one at a time.
              Matches fromanother's styles_contents__sXx5R exactly.
            */}
            <div className="contents">
              <h3 className="contents-title-wrapper">
                <span className="contents-titles">
                  {work.map((slide, i) => (
                    <span
                      key={slide.href}
                      className={`contents-title${i === 0 ? " contents-title-active" : ""}`}
                      aria-hidden={i === 0 ? "false" : "true"}
                    >
                      {slide.title}
                    </span>
                  ))}
                </span>
              </h3>

              <div className="contents-services-stack">
                {work.map((slide, i) => (
                  <div
                    key={slide.href}
                    className={`contents-services${i === 0 ? " contents-services-active" : ""}`}
                    aria-hidden={i === 0 ? "false" : "true"}
                  >
                    {slide.services.map((s) => (
                      <span key={s} className="contents-services-item">
                        {s}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination  →  styles_pagination__pyG7t */}
            <nav className="pagination" aria-label="Showcase carousel">
              <button
                ref={prevBtnRef}
                type="button"
                className="pagination-btn"
                aria-label="Previous project"
                disabled
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M11.625 6H0.375"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4.125 2.25L0.375 6L4.125 9.75"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <Link href="/works" className="pagination-link">
                View all projects
              </Link>

              <button
                ref={nextBtnRef}
                type="button"
                className="pagination-btn"
                aria-label="Next project"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M0.375 6H11.625"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.875 2.25L11.625 6L7.875 9.75"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeaturedWork;
