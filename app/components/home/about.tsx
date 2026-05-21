import React from "react";
import BlockTextReveal from "../animations/blockTextReveal";

const About = () => {
  return (
    <div
      className="about relative w-full grid-w pt-margin max-xl:mb-100! xl:pb-margin"
      data-widget
      data-widget-title="About"
      data-widget-url="/about"
    >
      {/* Top-left bracket */}
      <div
        className="absolute left-0 top-0"
        style={{ width: "var(--grid-margin)", height: "var(--grid-margin)" }}
      >
        <div className="absolute w-1/2 h-px bg-black left-4 bottom-0"></div>
        <div className="absolute w-px h-1/2 bg-black right-0 top-4"></div>
      </div>

      {/* Top-right bracket */}
      <div
        className="absolute right-0 top-0"
        style={{ width: "var(--grid-margin)", height: "var(--grid-margin)" }}
      >
        <div className="absolute w-1/2 h-px bg-black right-4      bottom-0"></div>
        <div className="absolute w-px h-1/2 bg-black left-0 top-4"></div>
      </div>

      <div className="col-span-full md:col-span-3 xl:col-span-2 max-md:mb-52!">
        <div className="relative w-full h-0 pt-[120%]!">
          <div className="absolute top-0 left-0 w-full h-[calc(100%+25rem)]">
            <div className="relative md:sticky md:top-24 md:left-0 w-full h-0 pt-[120%]!">
              <div className="absolute inset-0">
                <figure className="w-full h-full">
                  <img
                    src="/about-1.jpg"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </figure>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-full md:col-start-5 xl:col-start-7 md:col-end-11 max-md:order-first max-md:mb-52! flex flex-col justify-between">
        <div className="subtitle flex gap-x-10 uppercase">
          <BlockTextReveal animateOnScroll blockColor="#c9522a">
            <div className="subtitle-number overflow-hidden">01</div>
          </BlockTextReveal>
          <BlockTextReveal animateOnScroll blockColor="#c9522a">
            <div className="subtitle-text">About</div>
          </BlockTextReveal>
        </div>
        <div className="wysiwyg w-full max-md:mt-24!">
          <p className="title">
            Designing interfaces where brand, motion, and engineering move as
            one — creating digital experiences that feel clear, elevated, and
            built for the future.
          </p>
        </div>
      </div>
      <div className="col-span-full mb-32! md:mt-82! md:mb-72!">
        <div className="title block md:-mt-36 lg:-mt-42 xl:-mt-48">
          <span className="inline-block md:w-[808px] xl:w-[624px] max-md:hidden" />
          <h2 className="offset-title inline w-full text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[110%] font-bold tracking-tighter">
            Designing tomorrow’s digital presence through motion, systems, and
            code.
          </h2>
        </div>
      </div>

      <div className="about-content col-span-full md:col-start-1 md:col-end-4 xl:col-start-4 xl:col-end-6  max-md:mb-32! max-md:no-br title">
        Web Design
        <br />& Development
      </div>

      <h3 className="col-span-full md:col-start-5 xl:col-start-7 md:col-end-11 xl:pb-150!">
        <div className="wysiwyg">
          <p className="title">
            Building digital experiences that balance emotion with logic —
            combining scalable systems, refined aesthetics, and interaction-led
            storytelling.
          </p>
        </div>
      </h3>
    </div>
  );
};

export default About;
