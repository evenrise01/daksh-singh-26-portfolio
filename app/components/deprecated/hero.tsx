"use client";

import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/all";
import BlockTextReveal from "../animations/blockTextReveal";

gsap.registerPlugin(SplitText, CustomEase);

CustomEase.create("hop", "0.9, 1, 0.1, 1");
CustomEase.create("glide", "0.8, 0, 0.2, 1");

const Hero = () => {
  useGSAP(() => {
    const introImages = document.querySelectorAll(".intro-img");
    const counterEl = document.querySelector(
      ".preloader-counter p",
    ) as HTMLElement;

    const introImgScale = 0.2;
    const introImgGap = 40;
    const introImgRotations = [-15, 5, -7.5, 10, -2.5];

    const introImgScaledWidth = window.innerWidth * introImgScale;
    const introImgRowWidth = introImgScaledWidth * 5 + introImgGap * 4;
    const introImgCenteredX = (window.innerWidth - introImgRowWidth) / 2;
    const introImgOffScreenX = introImgCenteredX - window.innerWidth * 1.3;

    introImages.forEach((img, i) => {
      const centeredX =
        introImgCenteredX +
        i * (introImgScaledWidth + introImgGap) +
        introImgScaledWidth / 2 -
        window.innerWidth / 2;

      const offScreenX =
        introImgOffScreenX +
        i * (introImgScaledWidth + introImgGap) +
        introImgScaledWidth / 2 -
        window.innerWidth / 2;

      gsap.set(img, {
        scale: introImgScale,
        x: offScreenX,
        rotation: introImgRotations[i],
        borderRadius: "2.5rem",
      });

      img.dataset.centeredX = centeredX.toString();
    });

    SplitText.create(".hero-header h1, .hero-social p, .hero-social a", {
      type: "lines",
      linesClass: "line",
      mask: "lines",
      autoSplit: true,
    });

    gsap.set(".hero-header .line, .hero-social .line", { y: "125%" });

    const tl = gsap.timeline({ delay: 1 });

    // Counter object
    const counter = { value: 0 };

    // 🔥 Preloader fill + Counter sync
    tl.to(
      counter,
      {
        value: 100,
        duration: 1.5,
        ease: "glide",
        onUpdate: () => {
          if (counterEl) {
            counterEl.textContent = `${Math.round(counter.value)}%`;
          }
        },
      },
      0,
    );

    tl.to(
      ".preloader",
      {
        scaleX: 1,
        duration: 1.5,
        ease: "glide",
        onComplete: () => {
          gsap.set(".preloader", { transformOrigin: "right" });
        },
      },
      0,
    );

    // Scale back down
    tl.to(".preloader", {
      scaleX: 0,
      duration: 1.25,
      ease: "hop",
    });

    tl.to(
      ".preloader-overlay",
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        duration: 1,
        ease: "hop",
      },
      "<0.75",
    );

    introImages.forEach((img) => {
      tl.to(
        img,
        {
          x: parseFloat(img.dataset.centeredX || "0"),
          duration: 1.5,
          ease: "glide",
        },
        "<0.025",
      );
    });

    tl.to(
      ".intro-img:nth-child(1), .intro-img:nth-child(2)",
      {
        x: "-100vw",
        duration: 1.5,
        ease: "glide",
      },
      "spread",
    );

    tl.to(
      ".intro-img:nth-child(4), .intro-img:nth-child(5)",
      {
        x: "100vw",
        duration: 1.5,
        ease: "glide",
      },
      "spread",
    );

    tl.to(
      ".hero-img",
      {
        scale: 1,
        x: 0,
        rotation: 0,
        borderRadius: "0",
        duration: 1.5,
        ease: "glide",
      },
      "<",
    );

    tl.to(
      ".hero-header .line",
      {
        y: "0%",
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
      },
      "<",
    );

    tl.to(
      ".hero-social .line",
      {
        y: "0%",
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
      },
      "<0.25",
    );
  }, []);

  return (
    <>
      <div className="preloader-overlay">
        <div className="preloader-content flex flex-col items-center justify-center gap-12!">
          <div className="preloader-counter meta">
            <p>0%</p>
          </div>
          <div className="preloader-greeting title">
            <BlockTextReveal animateOnScroll blockColor="#f99e76">
              <p>Crafting Websites of Tomorrow.</p>
            </BlockTextReveal>
          </div>
          <div className="preloader"></div>
        </div>
      </div>

      <section className="hero">
        <div className="intro-img media">
          <img src="/home/1.jpg" alt="" />
        </div>
        <div className="intro-img media">
          <img src="/home/3.jpg" alt="" />
        </div>
        <div className="intro-img media hero-img">
          <img src="/home/2.jpg" alt="" />
        </div>
        <div className="intro-img media">
          <img src="/home/4.jpg" alt="" />
        </div>
        <div className="intro-img media">
          <img src="/home/5.jpg" alt="" />
        </div>

        <div className="hero-content">
          <div className="hero-header">
            <h1 className="title">
              I love to breathe life into your ideas and websites.
            </h1>
          </div>
          <div className="hero-social subtitle">
            <p>Say Hello!</p>
            <a href="#">hello@dakshsingh</a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
