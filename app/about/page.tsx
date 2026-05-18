"use client";
import React from "react";
import { usePageEnter } from "../hooks/usePageEnter";

const AboutPage = () => {
  usePageEnter();
  return (
    <>
      <div className="transition-revealer"></div>
      <div className="hero">AboutPage</div>
    </>
  );
};

export default AboutPage;
