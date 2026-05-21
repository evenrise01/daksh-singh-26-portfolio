"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/all";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import {
  vertexShader,
  fluidShader,
  displayShader,
} from "../shaders/fluidShader";
gsap.registerPlugin(useGSAP, SplitText, CustomEase, ScrollTrigger);

CustomEase.create("hop", "0.9, 0, 0.1, 1");

// ── Marquee data ─────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  "Available for projects",
  "Based in Jaipur, India",
  "Creative Developer",
  "Brand Experiences",
  "Digital Direction",
  "Open to collaborate",
];

const config = {
  brushSize: 25.0,
  brushStrength: 0.5,
  distortionAmount: 2.5,
  fluidDecay: 0.98,
  trailLength: 0.8,
  stopDecay: 0.85,
  color1: "#F0EBE3", // warm white
  color2: "#C4A898", // muted blush
  color3: "#F38D68", // single orange accent
  color4: "#E8DDD4", // warm grey
  colorIntensity: 0.85,
  softness: 2.5,
};

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      function hexToRgb(hex: string) {
        const r = parseInt(hex.slice(1, 3), 16) / 256;
        const g = parseInt(hex.slice(3, 5), 16) / 256;
        const b = parseInt(hex.slice(5, 7), 16) / 256;

        return [r, g, b];
      }

      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const renderer = new THREE.WebGLRenderer({ antialias: true });

      const gradientCanvas = document.querySelector(".gradient-canvas");
      renderer.setSize(window.innerWidth, window.innerHeight);
      gradientCanvas?.appendChild(renderer.domElement);

      const fluidTarget1 = new THREE.WebGLRenderTarget(
        window.innerWidth,
        window.innerHeight,
        {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          format: THREE.RGBAFormat,
          type: THREE.FloatType,
        },
      );

      const fluidTarget2 = new THREE.WebGLRenderTarget(
        window.innerWidth,
        window.innerHeight,
        {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          format: THREE.RGBAFormat,
          type: THREE.FloatType,
        },
      );

      let currentFluidTarget = fluidTarget1;
      let prevFluidTarget = fluidTarget2;
      let frameCount = 0;

      const fluidMaterial = new THREE.ShaderMaterial({
        uniforms: {
          iTime: { value: 0 },
          iResolution: {
            value: new THREE.Vector2(window.innerWidth, window.innerHeight),
          },
          iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
          iFrame: { value: 0 },
          iPreviousFrame: { value: null },
          uBrushSize: { value: config.brushSize },
          uBrushStrength: { value: config.brushStrength },
          uFluidDecay: { value: config.fluidDecay },
          uTrailLength: { value: config.trailLength },
          uStopDecay: { value: config.stopDecay },
        },
        vertexShader: vertexShader,
        fragmentShader: fluidShader,
      });

      const displayMaterial = new THREE.ShaderMaterial({
        uniforms: {
          iTime: { value: 0 },
          iResolution: {
            value: new THREE.Vector2(window.innerWidth, window.innerHeight),
          },
          iFluid: { value: null },
          uDistortionAmount: { value: config.distortionAmount },
          uColor1: { value: new THREE.Vector3(...hexToRgb(config.color1)) },
          uColor2: { value: new THREE.Vector3(...hexToRgb(config.color2)) },
          uColor3: { value: new THREE.Vector3(...hexToRgb(config.color3)) },
          uColor4: { value: new THREE.Vector3(...hexToRgb(config.color4)) },
          uColorIntensity: { value: config.colorIntensity },
          uSoftness: { value: config.softness },
        },
        vertexShader: vertexShader,
        fragmentShader: displayShader,
      });

      const geometry = new THREE.PlaneGeometry(2, 2);
      const fluidPlane = new THREE.Mesh(geometry, fluidMaterial);
      const displayPlane = new THREE.Mesh(geometry, displayMaterial);

      let mouseX = 0,
        mouseY = 0;
      let prevMouseX = 0,
        prevMouseY = 0;
      let lastMoveTime = 0;

      document.addEventListener("mousemove", (e) => {
        const rect = gradientCanvas?.getBoundingClientRect();

        if (!rect) return;
        prevMouseX = mouseX;
        prevMouseY = mouseY;
        mouseX = e.clientX - rect?.left;
        mouseY = rect?.height - (e.clientY - rect.top);
        lastMoveTime = performance.now();
        fluidMaterial.uniforms.iMouse.value.set(
          mouseX,
          mouseY,
          prevMouseX,
          prevMouseY,
        );
      });

      document.addEventListener("mouseleave", () => {
        fluidMaterial.uniforms.iMouse.value.set(0, 0, 0, 0);
      });

      function animate() {
        requestAnimationFrame(animate);

        const time = performance.now() * 0.001;
        fluidMaterial.uniforms.iTime.value = time;
        displayMaterial.uniforms.iTime.value = time;

        // ✅ Only reset mouse if idle — remove the unconditional set(0,0,0,0)
        if (performance.now() - lastMoveTime > 100) {
          fluidMaterial.uniforms.iMouse.value.set(0, 0, 0, 0);
        }

        fluidMaterial.uniforms.iFrame.value = frameCount; // ✅ also missing this

        fluidMaterial.uniforms.uBrushSize.value = config.brushSize;
        fluidMaterial.uniforms.uBrushStrength.value = config.brushStrength;
        fluidMaterial.uniforms.uFluidDecay.value = config.fluidDecay;
        fluidMaterial.uniforms.uTrailLength.value = config.trailLength;
        fluidMaterial.uniforms.uStopDecay.value = config.stopDecay;

        displayMaterial.uniforms.uDistortionAmount.value =
          config.distortionAmount;
        displayMaterial.uniforms.uColorIntensity.value = config.colorIntensity;
        displayMaterial.uniforms.uSoftness.value = config.softness;

        // ✅ Fix: use the correct color for each uniform
        displayMaterial.uniforms.uColor1.value.set(...hexToRgb(config.color1));
        displayMaterial.uniforms.uColor2.value.set(...hexToRgb(config.color2));
        displayMaterial.uniforms.uColor3.value.set(...hexToRgb(config.color3));
        displayMaterial.uniforms.uColor4.value.set(...hexToRgb(config.color4));

        fluidMaterial.uniforms.iPreviousFrame.value = prevFluidTarget.texture;
        renderer.setRenderTarget(currentFluidTarget);
        renderer.render(fluidPlane, camera);

        displayMaterial.uniforms.iFluid.value = currentFluidTarget.texture;
        renderer.setRenderTarget(null);
        renderer.render(displayPlane, camera);

        const tempt = currentFluidTarget;
        currentFluidTarget = prevFluidTarget;
        prevFluidTarget = tempt;

        frameCount++;
      }

      window.addEventListener("resize", () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        renderer.setSize(width, height);
        fluidMaterial.uniforms.iResolution.value.set(width, height);
        displayMaterial.uniforms.iResolution.value.set(width, height);

        fluidTarget1.setSize(width, height);
        fluidTarget2.setSize(width, height);
        frameCount = 0;
      });
      animate();
      // ── 0. Initial states ──────────────────────────────────────────────────
      gsap.set(".preloader-counter p", { y: 20 });
      gsap.set(".preloader-bar-fill", { scaleX: 0 });
      gsap.set(".preloader-quote", { autoAlpha: 0 });
      gsap.set(".preloader-index", { autoAlpha: 0 });
      gsap.set(".hero-section", {
        clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)",
        scale: 0.72,
      });
      gsap.set(".hero-overlay", {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      });
      gsap.set(
        [
          ".hero-eyebrow",
          ".hero-meta-left",
          ".hero-meta-right",
          ".hero-rule",
          ".hero-marquee-wrap",
        ],
        { autoAlpha: 0 },
      );

      // ── 1. Master preloader timeline ───────────────────────────────────────
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(".preloader-counter p", { y: 0, duration: 0.8 });
      tl.to(".preloader-index", { autoAlpha: 1, duration: 0.4 }, "<0.1");

      const counterEl = containerRef.current?.querySelector(
        ".preloader-counter p",
      ) as HTMLElement;
      const fillEl = containerRef.current?.querySelector(
        ".preloader-bar-fill",
      ) as HTMLElement;
      const counterObj = { val: 0 };

      tl.to(
        counterObj,
        {
          val: 100,
          duration: 2.2,
          ease: "power2.inOut",
          onUpdate() {
            if (counterEl)
              counterEl.textContent = `${Math.round(counterObj.val)}%`;
          },
        },
        "<0.1",
      );

      tl.to(
        fillEl,
        {
          scaleX: 1,
          duration: 2.2,
          ease: "power2.inOut",
          transformOrigin: "left center",
        },
        "<",
      );

      const split = SplitText.create(".preloader-quote", {
        type: "lines",
        mask: "lines",
      });

      tl.fromTo(
        split.lines,
        { y: 24 },
        { y: 0, duration: 0.7, stagger: 0.12, ease: "power3.out" },
        "-=1.2",
      );
      tl.to(".preloader-quote", { autoAlpha: 1, duration: 0 }, "<");

      // ── 2. Beat ────────────────────────────────────────────────────────────
      tl.to({}, { duration: 0.55 });

      // ── 3. Reveal ─────────────────────────────────────────────────────────
      tl.to(".hero-section", {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
        scale: 1,
        duration: 1.9,
        ease: "hop",
      });

      tl.to(
        ".hero-overlay",
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: 1.6,
          ease: "hop",
        },
        "<0.25",
      );

      tl.to(
        ".preloader-ui",
        { autoAlpha: 0, y: -12, duration: 0.6, ease: "power2.in" },
        "<0.1",
      );

      // ── 4. Hero content reveal sequence ───────────────────────────────────

      // Eyebrows fade in
      tl.to(
        ".hero-eyebrow",
        { autoAlpha: 1, duration: 0.5, ease: "power2.out" },
        "-=0.7",
      );

      // Rule draws across
      tl.to(
        ".hero-rule",
        {
          autoAlpha: 1,
          scaleX: 1,
          duration: 0.9,
          ease: "power3.inOut",
        },
        "<0.1",
      );

      // Headline lines slide up from mask
      const heroSplit = SplitText.create(".hero-h1", {
        type: "lines",
        mask: "lines",
      });

      tl.fromTo(
        heroSplit.lines,
        { y: "105%" },
        {
          y: "0%",
          duration: 1.1,
          stagger: 0.09,
          ease: "power3.out",
        },
        "-=0.55",
      );

      // Bottom meta
      tl.to(
        [".hero-meta-left", ".hero-meta-right"],
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.6",
      );

      // Marquee
      tl.to(
        ".hero-marquee-wrap",
        { autoAlpha: 1, duration: 0.5, ease: "power2.out" },
        "<0.15",
      );

      // ── 5. Signal navbar ──────────────────────────────────────────────────
      tl.add(() => {
        document.documentElement.classList.add("is-ready");
      }, "-=0.4");

      // ── 6. Scroll-driven parallax (after intro settles) ───────────────────
      tl.add(() => {
        // Headline drifts up — the hero content has momentum past the fold
        gsap.to(".hero-h1", {
          yPercent: -18,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
          },
        });

        // Eyebrow row drifts opposite — creates layered depth
        gsap.to(".hero-top", {
          yPercent: 40,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });

        // Bottom bar fades + slides as user scrolls away
        gsap.to(".hero-bottom", {
          yPercent: 14,
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "38% top",
            scrub: 0.6,
          },
        });

        // Marquee fades on scroll
        gsap.to(".hero-marquee-wrap", {
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "25% top",
            scrub: 0.5,
          },
        });
      });
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="hero-container">
      {/* ── PRELOADER UI ────────────────────────────────────────────────────── */}
      <div className="preloader-ui">
        <div className="preloader-counter meta">
          <p>0%</p>
        </div>
        <div className="preloader-bottom">
          <p className="preloader-index meta">Loading</p>
          <div className="preloader-bar">
            <div className="preloader-bar-fill" />
          </div>
          <p className="preloader-quote title">
            Designing experiences
            <br />
            for the future.
          </p>
        </div>
      </div>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="hero-section" data-theme="light">

        <div className="hero-overlay" />
        <div className="gradient-canvas absolute left-0 top-0 h-full w-full"></div>
        <div className="hero-inner">
          {/* Top eyebrow strip */}
          {/* <div className="hero-top">
            <span className="hero-eyebrow meta">
              Creative Developer &amp; Director
            </span>
            <span className="hero-eyebrow hero-eyebrow--right meta">
              &copy;&nbsp;2025
            </span>
          </div> */}

          {/* Compositional rule */}
          {/* <div className="hero-rule" aria-hidden="true" /> */}

          {/* The headline — editorial, asymmetric */}
          <div className="hero-headline-wrap">
            <h1 className="hero-h1">
              <span className="hero-line">I breathe</span>
              <span className="hero-line hero-line--indent">life into</span>
              <span className="hero-line">
                ideas &amp; the <em className="hero-em">web</em>
                <span className="hero-period" aria-hidden="true">
                  .
                </span>
              </span>
            </h1>
          </div>

          {/* Bottom strip */}
          <div className="hero-bottom">
            <div className="hero-meta-left">
              <p className="meta hero-meta-label">Say hello</p>
              <a href="mailto:hello@dakshsingh.co" className="hero-email">
                hello@dakshsingh.co
              </a>
            </div>

            <div className="hero-meta-right">
              <p className="meta hero-meta-label">Scroll</p>
              <div className="hero-scroll-indicator" aria-hidden="true">
                <div className="hero-scroll-line" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
