import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import Contact from "@/components/Contact";
import Content from "@/components/Content";
import Footer from "@/components/Footer";
import PricingHero from "@/components/hero/PricingHero";
import Testimonials from "@/components/Testimonials";
import { Spiral } from "@/constants/Icons";
import { Check } from "lucide-react";
import Image from "next/image";
import React from "react";

const page = () => {
  return (
    <div className="flex flex-col justify-center items-center -mt-16 w-full h-full">
      <PricingHero />
      <Content />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
};

export default page;
