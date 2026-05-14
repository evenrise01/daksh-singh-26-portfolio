"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

function useClock() {
  const [time, setTime] = useState({ h: "", m: "", ap: "" });
  const [colonVisible, setColonVisible] = useState(true);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      let h = now.getHours();
      const m = now.getMinutes();
      const ap = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      setTime({
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        ap,
      });
    };
    tick();
    const timeInterval = setInterval(tick, 10000);
    const colonInterval = setInterval(() => setColonVisible((v) => !v), 1000);
    return () => {
      clearInterval(timeInterval);
      clearInterval(colonInterval);
    };
  }, []);

  return { time, colonVisible };
}

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const { time, colonVisible } = useClock();

  useGSAP(
    () => {
      const menuToggle = navRef.current?.querySelector(".header-toggler");
      const headerOverlay =
        navRef.current?.querySelector<HTMLElement>(".header-overlay");
      const menuLinks = navRef.current?.querySelectorAll<HTMLElement>(
        ".header-link-mobile",
      );
      const togglerMenu = navRef.current?.querySelector<HTMLElement>(
        ".header-toggler-menu",
      );
      const togglerClose = navRef.current?.querySelector<HTMLElement>(
        ".header-toggler-close",
      );
      const socials = navRef.current?.querySelectorAll<HTMLElement>(
        ".header-social-link",
      );

      if (
        !menuToggle ||
        !headerOverlay ||
        !menuLinks ||
        !togglerMenu ||
        !togglerClose
      )
        return;

      // ── Set initial states ──────────────────────────────
      // Menu links start clipped below their overflow-hidden parent
      gsap.set(menuLinks, { yPercent: 115 });
      // Socials start invisible
      gsap.set(socials, { autoAlpha: 0, y: 8 });
      // "Close" text starts offset so it can animate in
      gsap.set(togglerClose, { yPercent: 110, opacity: 0 });

      // ── Build the open timeline, paused ─────────────────
      tlRef.current = gsap.timeline({
        paused: true,
        defaults: { ease: "power4.inOut" },
      });

      tlRef.current
        // 1. Overlay wipes down
        .to(headerOverlay, {
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          duration: 1,
        })
        // 2. "Menu" text exits upward — starts with overlay
        .to(
          togglerMenu,
          {
            yPercent: -110,
            opacity: 0,
            duration: 0.4,
            ease: "power3.in",
          },
          "<0.1",
        )
        // 3. "Close" text reveals from below
        .to(
          togglerClose,
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.45,
            ease: "power3.out",
          },
          "<0.15",
        )
        // 4. Nav links stagger up through their overflow-hidden clip
        .to(
          menuLinks,
          {
            yPercent: 0,
            duration: 0.65,
            ease: "power3.out",
            stagger: 0.07,
          },
          "-=0.55",
        )
        // 5. Socials fade up last
        .to(
          socials,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
            stagger: 0.08,
          },
          "-=0.3",
        );

      // ── Click handler — play / reverse the same timeline ─
      const handleClick = () => {
        if (tlRef.current?.isActive()) return; // guard during animation

        if (tlRef.current?.progress() === 0) {
          tlRef.current.play();
          document.body.style.overflow = "hidden";
        } else {
          tlRef.current?.reverse();
          // restore scroll after reverse completes
          tlRef.current?.eventCallback("onReverseComplete", () => {
            document.body.style.overflow = "";
          });
        }
      };

      menuToggle.addEventListener("click", handleClick);
      return () => menuToggle.removeEventListener("click", handleClick);
    },
    { scope: navRef },
  );

  return (
    <>
      <header
        ref={navRef}
        className="header sticky top-0 left-0 grid-w content-end w-full h-header z-header subtitle"
      >
        <div className="col-span-3 md:col-span-2">
          <Link
            href={"/"}
            aria-label="home"
            className="header-logo flex svg-wrapper overflow-hidden"
          >
            <img src="logo-wordmark.svg" alt="" className="h-6 w-auto" />
          </Link>
        </div>

        {/* ── Mobile toggler — both states stacked, clipped by overflow-hidden ── */}
        <div className="col-span-3 md:col-span-10 flex justify-end xl:hidden">
          <div className="header-toggler relative h-full flex items-center cursor-pointer overflow-hidden">
            <span className="header-toggler-menu inline-block">Menu</span>
          </div>
        </div>

        <div className="col-span-7 flex justify-start -mb-4 max-xl:hidden">
          <div className="header-links list-o flex items-end overflow-hidden">
            <Link href={"/works"} className="header-link list-o-item">
              Work
            </Link>
            <Link href={"/process"} className="header-link list-o-item">
              Process
            </Link>
            <Link href={"/about"} className="header-link list-o-item">
              About
            </Link>
          </div>
        </div>

        <div className="col-span-2 flex gap-x-12 items-end -mb-4 max-xl:hidden overflow-hidden">
          <span className="header-time flex gap-x-1 uppercase opacity-25">
            <span id="hour">{time.h}</span>
            <span id="semicolon">:</span>
            <span id="minute">{time.m}</span>
            <span id="ampm" className="ml-2">
              {time.ap}
            </span>
          </span>
          <span className="header-location inline-block">Jaipur, IND</span>
        </div>

        <div className="col-span-1 flex items-end justify-end -mb-4 max-xl:hidden overflow-hidden">
          <a
            href="mailto:dakshsingh.shanu@gmail.com"
            className="header-contact block xl:hover:opacity-24"
          >
            Reach out
          </a>
        </div>

        {/* ── Overlay — clip-path is the visibility mechanism ── */}
        <div className="header-overlay fixed top-0 left-0 w-full h-full pointer-events-none xl:hidden">
          <div className="header-menu fixed top-0 left-0 w-full h-full overflow-hidden xl:hidden">
            <div className="header-menu-inner overflow-hidden w-full h-full absolute top-0 left-0 flex flex-col justify-center px-margin">
              <div className="absolute top-0 left-0 w-full h-header grid-w content-end">
                <div className="col-span-3 md:col-span-2">
                  <a
                    href="/"
                    aria-label="Home"
                    className="flex svg-wrapper overflow-hidden"
                  >
                    <img src="logo-wordmark.svg" alt="" className="invert" />
                  </a>
                </div>
                <div className="col-span-3 md:col-span-10 flex justify-end xl:hidden overflow-hidden">
                  <div className="header-toggler-close">Close</div>
                </div>
              </div>

              {/* Nav links — overflow-hidden on parent clips the yPercent slide */}
              <nav className="flex flex-col gap-y-12 items-start hero">
                {[
                  { href: "/", label: "Home" },
                  { href: "/works", label: "Work" },
                  { href: "/process", label: "Process" },
                  { href: "/about", label: "About" },
                  {
                    href: "mailto:dakshsingh.shanu@gmail.com",
                    label: "Contact",
                  },
                ].map(({ href, label }) => (
                  <a
                    key={label}
                    href={href}
                    className="overflow-hidden block leading-none py-1"
                  >
                    <span className="header-link-mobile inline-block">
                      {label}
                    </span>
                  </a>
                ))}
              </nav>

              {/* Socials */}
              <div className="absolute left-margin right-margin bottom-20 flex gap-x-2">
                <a
                  href=""
                  target="_blank"
                  rel="noopener"
                  className="header-social-link"
                >
                  Instagram,
                </a>
                <a
                  href=""
                  target="_blank"
                  rel="noopener"
                  className="header-social-link"
                >
                  Linkedin
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
