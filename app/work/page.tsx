"use client";
import React from "react";
import { usePageEnter } from "../hooks/usePageEnter";

const WorkPage = () => {
  usePageEnter();
  return (
    <>
      <div className="transition-revealer"></div>
      <div className="hero">Work page</div>
    </>
  );
};

export default WorkPage;
