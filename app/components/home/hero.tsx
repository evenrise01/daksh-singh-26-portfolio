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
    function animateCounter() {
      const counterEl = document.querySelector(
        ".preloader-counter p",
      ) as HTMLElement;

      let currentValue = 0;
      const updateInterval = 300;
      const maxDuration = 2000;
      const endvalue = 100;
      const startTime = Date.now();

      function updateCounter() {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < maxDuration) {
          currentValue = Math.min(
            currentValue + Math.floor(Math.random() * 30) + 5,
            endvalue,
          );
          counterEl.textContent = `${Math.round(currentValue)}%`;
          setTimeout(updateCounter, updateInterval);
        } else {
          counterEl.textContent = currentValue.toString();
          setTimeout(() => {
            gsap.to(counterEl, {
              y: -20,
              duration: 1,
              ease: "power3.inOut",
              onStart: () => {
                revealLandingPage();
              },
            });
          }, 500);
        }
      }
      updateCounter();
    }
    gsap.to(".preloader-counter p", {
      y: 0,
      duration: 1,
      ease: "power3.out",
      onComplete: animateCounter,
    });

    function revealLandingPage() {
      gsap.to(".hero-section", {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
        duration: 2,
        ease: "hop",
        onStart: () => {
          gsap.to(".hero-section", {
            transform: "translate(-50%, -50%) scale(1)",
            duration: 2.25,
            ease: "power3.inOut",
            delay: 0.25,
          });

          gsap.to(".hero-overlay", {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            duration: 2,
            delay: 0.5,
            ease: "hop",
          });
        },
      });
    }
  }, []);

  return (
    <div className="hero-container w-full h-screen overflow-hidden">
      <div className="preloader-counter meta">
        <p>0%</p>
      </div>
      {/* <div className="preloader-overlay">
        <div className="preloader-content flex flex-col items-center justify-center gap-12!">
          
          <div className="preloader-greeting title">
            <BlockTextReveal animateOnScroll blockColor="#f99e76">
              <p>Crafting Websites of Tomorrow.</p>
            </BlockTextReveal>
          </div>
          <div className="preloader"></div>
        </div>
      </div> */}

      <section className="hero-section">
        <div className="hero-overlay"></div>
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
    </div>
  );
};

export default Hero;
