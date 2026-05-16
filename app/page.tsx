"use client";
import Image from "next/image";
import Navbar from "./components/layout/navbar";
import Hero from "./components/hero/hero";
import ReactLenis from "lenis/react";
import BlockTextReveal from "./components/animations/blockTextReveal";
import { useRef } from "react";
import About from "./components/home/about";
import FeaturedWork from "./components/home/featured-work";

export default function Home() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <>
      <ReactLenis root options={{ duration: 1.2 }}>
        <div id="app">
          <Navbar />
          <main id="main" data-taxi>
            <div data-taxi-view>
              <div className="home">
                <div>
                  <section data-theme="dark">
                    <Hero />
                  </section>
                  <section data-theme="light">
                    <About />
                  </section>
                  <section className="w-full relative" data-theme="light">
                    <FeaturedWork />
                  </section>
                  {/* <section className="flex items-center justify-center h-screen w-full">
            <div className="flex gap-6">
              <BlockTextReveal animateOnScroll blockColor="#78c98f">
                <p className="w-[300px] text-wrap text-3xl font-semibold">
                  Emotion evoked through motion
                </p>
              </BlockTextReveal>
              <BlockTextReveal animateOnScroll blockColor="#f99e76">
                <p className="w-[500px] text-wrap">
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                  Voluptatibus, pariatur qui. Dicta illo, officiis, debitis
                  placeat facere blanditiis, omnis laudantium aut laborum enim
                  voluptate? Dignissimos sapiente porro dolorum nihil ducimus!
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Consequatur numquam provident asperiores consequuntur pariatur
                  recusandae ea suscipit quo non quae. Assumenda sint tempore
                  rem saepe ab magni repellat distinctio iste.
                </p>
              </BlockTextReveal>
            </div>
          </section> */}
                </div>
              </div>
            </div>
          </main>
        </div>
      </ReactLenis>
    </>
  );
}
