import Image from "next/image";
import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/all";

gsap.registerPlugin(SplitText, CustomEase);

CustomEase.create("hop", "0.9, 1, 0.1, 1");
CustomEase.create("glide", "0.8, 0, 0.2, 1");

const hero = () => {
  useGSAP(() => {
    const introImages = document.querySelectorAll(".intro-img");
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

      img.dataset.centeredX = centeredX;
    });

    SplitText.create(".hero-header h1, .hero-scoial p, .hero-social a", {
      type: "lines",
      linesClass: "line",
      mask: "lines",
      autoSplit: true,
    });

    gsap.set(".hero-header .line, .hero-social .line", { y: "125%" });

    const tl = gsap.timeline({ delay: 1 });

    tl.to(".preloader", {
      scaleX: 1,
      duration: 1.5,
      ease: "glide",
      onComplete: () => {
        gsap.set(".preloader", { transformOrigin: "right" });
      },
    });

    tl.to(".preloader", { scaleX: 0, duration: 1.25, ease: "hop" });

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
          x: parseFloat(img.dataset.centeredX),
          duration: 1.5,
          ease: "glide",
        },
        "<0.025",
      );
    });

    (tl.to(
      ".intro-img:nth-child(1), .intro-img:nth-child(2)",
      {
        x: "-100vw",
        duration: 1.5,
        ease: "glide",
      },
      "spread",
    ),
      tl.to(
        ".intro-img:nth-child(4), .intro-img:nth-child(5)",
        {
          x: "100vw",
          duration: 1.5,
          ease: "glide",
        },
        "spread",
      ));

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
      " <",
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
  }, {});
  return (
    <>
      <div className="preloader-overlay">
        <div className="preloader"></div>
      </div>
      <section className="hero">
        <div className="intro-img media">
          <img src="/home/1.jpg" alt="" />
        </div>
        <div className="intro-img media ">
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

export default hero;
