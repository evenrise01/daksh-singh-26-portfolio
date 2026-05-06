'use client'
import Image from "next/image";
import Navbar from "./components/layout/navbar";
import Hero from "./components/hero/hero";
import ReactLenis from "lenis/react";
import BlockTextReveal from "./components/animations/blockTextReveal";
import { useRef } from "react";
import ScrollDrivenBlockTextReveal from "./components/animations/scrollDrivenBlockTextReveal";

export default function Home() {
  const sectionRef = useRef<HTMLElement>(null);
  return (
    <>
      <ReactLenis root />
      {/* <Navbar /> */}
      <main>
        <Hero />
        <section className="flex items-center justify-center h-screen">
          <div className="flex gap-6">
            <BlockTextReveal animateOnScroll blockColor="#78c98f">
              <p className="w-[300px] text-wrap">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                Voluptatibus, pariatur qui. Dicta illo, officiis, debitis placeat
                facere blanditiis, omnis laudantium aut laborum enim voluptate?
                Dignissimos sapiente porro dolorum nihil ducimus!
              </p>
            </BlockTextReveal>
            <BlockTextReveal animateOnScroll blockColor="#78c98f">
              <p className="w-[300px] text-wrap">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                Voluptatibus, pariatur qui. Dicta illo, officiis, debitis placeat
                facere blanditiis, omnis laudantium aut laborum enim voluptate?
                Dignissimos sapiente porro dolorum nihil ducimus!
              </p>
            </BlockTextReveal>
          </div>
        </section>

        <section ref={sectionRef} className="h-screen flex items-center justify-center">
          <ScrollDrivenBlockTextReveal scrollConfig={{ scrub: true, markers: true, end: "+=" + 5000 }} blockColor="#78c98f">
            <p className="w-full text-wrap text-5xl text-center font-bold">
              Good Design Takes Time
            </p>
          </ScrollDrivenBlockTextReveal>
        </section>
      </main>
    </>
  );
}
