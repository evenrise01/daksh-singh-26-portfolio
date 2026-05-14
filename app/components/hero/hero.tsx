import React from "react";

const Hero = () => {
  return (
    <div className="cover-home block relative w-full">
      <div className="relative w-full h-screen">
        <div className="cover-home-title-dark absolute top-[25vh] left-margin max-xl:hidden hero w-[340px]"></div>
        <div className="cover-home-bottom-dark absolute left-0 bottom-[180px] grid-w w-full items-end max-xl:hidden">
          <div className="cover-home-scroll-dark col-span-2 flex max-md:hidden">
            <span className="cover-home-scroll-bracket inline-block">[</span>
            <span className="inline-block overflow-hidden">
              <span className="cover-home-scroll-text inline-block">
                Scroll
              </span>
              <span className="cover-home-scroll-text inline-block">down</span>
            </span>
            <span className="cover-home-scroll-bracket inline-block">]</span>
          </div>

          <div
            className="cover-home-content-dark col-span-full md:col-start-10 md:col-end-13 md:subtitle"
            aria-hidden="true"
          >
            Freelance Creative Developer
          </div>
        </div>
        <div className="cover-home-image absolute top-0 left-0 h-full w-full flex items-end pb-margin">
          <div className="cover-home-image-inner absolute top-0 left-0 h-full w-full overflow-hidden">
            <div className="cover-home-image-prlx absolute top-0 left-0 h-full w-full">
              <div className="image w-full h-full">
                <figure>
                  <img
                    src="/home-cover-test.jpg"
                    alt=""
                    className="h-full"
                  />
                </figure>
              </div>
              <div className="absolute top-0 left-0 h-full w-full bg-black/25"></div>
            </div>

            <div className="absolute top-0 left-0 w-full h-screen-mobile xl:h-screen">
              <div className="cover-home-title-light absolute top-1/2 xl:top-[25vh] max-xl:-translate-y-1/2 left-margin max-xl:right-margin xl:w-col-3 hero md:display xl:body-48"></div>
            </div>
          </div>
          <div className="cover-home-bottom-light sticky left-0 bottom-margin w-full grid-w items-end">
            <div className="col-span-2 max-xl:hidden opacity-60">
              [Scroll Down]
            </div>
            <h1 className="cover-home-content col-span-full md:col-start-7 lg:col-start-8 xl:col-start-10 md:col-end-13 title md:hero">
              Freelance Creative Developer specializing in brand and web design.
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
