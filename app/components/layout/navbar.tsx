"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLockScroll } from "@/app/hooks/useLockScroll";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";

const SOCIALS = [
  {
    label: "Instagram",
    href: "#",
  },
  {
    label: "X",
    href: "#",
  },
];
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
  const imgRef = useRef<HTMLElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const { time, colonVisible } = useClock();
  const [menuOpen, setMenuOpen] = useState(false);

  const router = useTransitionRouter();
  const pathname = usePathname();

  function triggerPageTransition() {
    document.documentElement.animate(
      [
        {
          clipPath: "polygon(25% 75%, 75% 75%, 75% 75%, 25% 75%)",
        },
        {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
        },
      ],
      {
        duration: 2000,
        easing: "cubic-bezier(0.9, 0, 0.1, 1)",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  }

  const handleNavigation = (path: string) => (e) => {
    if (path === pathname) {
      e.preventDefault();
      return;
    }
    router.push(path, {
      onTransitionReady: triggerPageTransition,
    });
  };
  useLockScroll(menuOpen);

  useGSAP(
    () => {
      // Set navbar invisible initially
      gsap.set(navRef.current, { autoAlpha: 0, y: -10 });

      // Poll for the signal (fires once Hero adds the class)
      const observer = new MutationObserver(() => {
        if (document.documentElement.classList.contains("is-ready")) {
          observer.disconnect();
          gsap.to(navRef.current, {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
          });
        }
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      return () => observer.disconnect();
    },
    { scope: navRef },
  );

  // ── Theme switching (unchanged) ──────────────────────────
  useEffect(() => {
    const header = navRef.current;
    const img = imgRef.current;
    if (!header || !img) return;

    const sections = document.querySelectorAll<HTMLElement>("[data-theme]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const theme = (entry.target as HTMLElement).dataset.theme;
          if (theme === "light") {
            header.classList.add("header-light");
            img.classList.add("nav-logo-light");
            img.classList.remove("nav-logo-dark");
            header.classList.remove("header-black");
          } else {
            header.classList.remove("header-light");
            img.classList.add("nav-logo-dark");
            img.classList.remove("nav-logo-light");
            header.classList.add("header-black");
          }
        });
      },
      {
        rootMargin: `-${navRef.current?.offsetHeight - 40 ?? 0}px 0px -95% 0px`,
        threshold: 0,
      },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // ── GSAP menu animation ──────────────────────────────────
  useGSAP(
    () => {
      const menuToggle =
        navRef.current?.querySelector<HTMLElement>(".header-toggler");

      const menuClose = navRef.current?.querySelector<HTMLElement>(
        ".header-toggler-close",
      );
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

      gsap.set(menuLinks, { yPercent: 115 });
      gsap.set(socials, { autoAlpha: 0, y: 8 });
      gsap.set(togglerClose, { yPercent: 110, opacity: 0 });
      gsap.set(".menu-rule", { scaleX: 0 });
      tlRef.current = gsap.timeline({
        paused: true,
        defaults: { ease: "power4.inOut" },
      });

      tlRef.current
        .to(headerOverlay, {
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          duration: 1,
          pointerEvents: "all",
        })
        .to(
          togglerMenu,
          { yPercent: -110, opacity: 0, duration: 0.4, ease: "power3.in" },
          "<0.1",
        )
        .to(
          togglerClose,
          { yPercent: 0, opacity: 1, duration: 0.45, ease: "power3.out" },
          "<0.15",
        )
        .to(
          ".menu-rule",
          {
            scaleX: 1,
            autoAlpha: 1,
            duration: 0.7,
            ease: "power3.inOut",
            transformOrigin: "left",
          },
          "-=0.5",
        )
        .to(
          menuLinks,
          { yPercent: 0, duration: 0.65, ease: "power3.out", stagger: 0.07 },
          "-=0.55",
        )
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

      // ← onReverseComplete: set menuOpen false AFTER animation settles
      tlRef.current.eventCallback("onReverseComplete", () => {
        gsap.set(headerOverlay, { pointerEvents: "none" });
        setMenuOpen(false);
      });

      tlRef.current.eventCallback("onStart", () => {
        gsap.set(headerOverlay, { pointerEvents: "all" });
      });

      const handleClick = () => {
        if (tlRef.current?.isActive()) return;

        if (tlRef.current?.progress() === 0) {
          setMenuOpen(true); // ← locks scroll via useLockScroll
          tlRef.current.play();
        } else {
          tlRef.current?.reverse();
          // menuOpen → false fires in onReverseComplete above
          // useLockScroll reacts and calls lenis.start()
        }
      };

      menuToggle?.addEventListener("click", handleClick);
      menuClose?.addEventListener("click", handleClick);

      return () => {
        menuToggle?.removeEventListener("click", handleClick);
        menuClose?.removeEventListener("click", handleClick);
      };
    },
    { scope: navRef },
  );
  return (
    <>
      <header
        ref={navRef}
        className="header sticky top-0 left-0 grid-w items-center content-end w-full h-header z-header "
      >
        <div className="col-span-3 md:col-span-2">
          <Link
            href={"/"}
            aria-label="home"
            className="header-logo flex svg-wrapper nav-logo overflow-hidden "
            onClick={handleNavigation("/")}
          >
            <img
              ref={imgRef}
              src="logo-wordmark.svg"
              alt=""
              className="h-6 w-auto"
            />
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
            <Link
              href={"/work"}
              className="header-link list-o-item"
              onClick={handleNavigation("/work")}
            >
              Work
            </Link>
            <Link
              href={"/process"}
              className="header-link list-o-item"
              onClick={handleNavigation("/process")}
            >
              Process
            </Link>
            <Link
              href={"/about"}
              className="header-link list-o-item"
              onClick={handleNavigation("/about")}
            >
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
        <div className="header-overlay fixed top-0 left-0 w-full h-screen pointer-events-none xl:hidden">
          <div className="header-menu fixed top-0 left-0 w-full h-screen overflow-hidden xl:hidden">
            <div className="header-menu-inner overflow-hidden px-margin">
              <div className="absolute top-0 left-0 w-full h-header grid-w content-end justify-center items-center">
                <div className="col-span-3 md:col-span-2">
                  <a
                    href="/"
                    aria-label="Home"
                    className="flex svg-wrapper overflow-hidden"
                  >
                    <img
                      src="logo-wordmark.svg"
                      alt=""
                      className="h-6 w-auto"
                    />
                  </a>
                </div>
                <div className="col-span-3 md:col-span-10 flex justify-end xl:hidden overflow-hidden">
                  <div className="header-toggler-close">Close</div>
                </div>
                <div
                  className="menu-rule w-full h-px mt-2 col-span-full"
                  aria-hidden="true"
                />
              </div>

              {/* Nav links — overflow-hidden on parent clips the yPercent slide */}
              <nav
                className="flex flex-col gap-y-6 items-start hero"
                aria-label="Mobile navigation"
              >
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
                  <Link
                    key={label}
                    href={href}
                    className="overflow-hidden block leading-none py-1 pr-1"
                    onClick={handleNavigation(href)}
                  >
                    <span className="header-link-mobile inline-block">
                      {label}
                    </span>
                  </Link>
                ))}
              </nav>

              {/* Socials */}
              <div className="absolute left-0 bottom-8 menu-meta flex items-end w-full px-margin justify-between">
                {/* Socials */}
                <div className="flex gap-x-4">
                  {SOCIALS.map(({ href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="menu-social meta opacity-50"
                      tabIndex={menuOpen ? 0 : -1}
                    >
                      {label}
                    </a>
                  ))}
                </div>

                {/* Location + time */}
                <div className="flex flex-col items-end gap-y-1">
                  <span className="caption opacity-30 uppercase tracking-widest">
                    Jaipur, IND
                  </span>
                  <span className="caption opacity-20 uppercase tracking-widest">
                    {time.h}:{time.m} {time.ap}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
