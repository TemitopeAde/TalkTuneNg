import Audience from "@/components/Audience";
import Contact from "@/components/Contact";
import Content from "@/components/Content";
import FeatureSection from "@/components/Features";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";
import React from "react";

const Main = () => {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <Hero />
      <Audience />
      <FeatureSection />
      <Content />
      <Testimonials />
      <Contact />
    </div>
  );
};

export default Main;
