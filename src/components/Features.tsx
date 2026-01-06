"use client";

import Image from "next/image";
import React, { useState } from "react";
import PrimaryBtn from "./buttons/PrimaryBtn";
import { Spiral, Spiral2 } from "@/constants/Icons";
import { Features } from "@/constants/Image";
import { useRouter } from "next/navigation";

const features = [
  {
    title: "Extensive Language Support",
    desc: "Over 1000 African languages: Pidgin English, Twi, Yoruba, Swahili, etc. Western languages.",
    heightClass: "h-[300px] md:h-[400px] lg:h-[500px]", // Responsive classes
  },
  {
    title: "Customization Options",
    desc: "Choose emotion, voice type, and more for personalised voiceovers.",
    heightClass: "h-[350px] md:h-[450px] lg:h-[550px]",
  },
  {
    title: "Voice Modulation",
    desc: "Adjust pitch, speed, and tone to suit your needs.",
    heightClass: "h-[400px] md:h-[500px] lg:h-[600px]",
  },
  {
    title: "Text-to-Speech-to-Video (Beta)",
    desc: "Create videos directly from text with synchronised voiceovers.",
    heightClass: "h-[375px] md:h-[475px] lg:h-[575px]",
  },
];

const FeatureSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter()

  const ITEM_HEIGHT = 100;

  return (
    <section className="relative bg-background px-6 md:px-[100px] justify-center flex flex-col items-center rounded-[40px] overflow-hidden py-16 md:py-24 w-full mx-auto text-white">
      <div className="text-center max-w-2xl mb-10">
        <p className="uppercase text-sm tracking-widest text-gray-300 font-semibold">
          Built for speed
        </p>
        <h2 className="text-3xl md:text-5xl font-bold mt-2">
          Achieve unlimited possibilities with Talktune
        </h2>
        <div className="mt-6 flex justify-center">
          <PrimaryBtn onClick={() => router.push("/auth/register")} label="Get Early Access" style={{
            zIndex: 20
          }} />
        </div>
      </div>
      <div className="absolute w-full -z-1 top-20 justify-end flex items-end h-[600px]">
        <Image src={Spiral2} alt="Spiral" fill className="object-contain" />
      </div>
      <div
        className="w-1/2 h-[400px] bg-[#A8EF4370] rounded-full absolute -top-20 
             transform blur-[200px] -z-1"
      />
      <div className="flex flex-col lg:flex-row items-center w-full justify-around gap-10 mt-12">
        <div
          className={`rounded-2xl overflow-hidden w-full relative shadow-xl transition-all duration-500 ease-in-out ${features[activeIndex].heightClass}`}
        >
          <Image
            src={Features}
            alt="Person recording with mic"
            className="object-cover w-full h-full transition-all duration-300"
            fill
            priority
          />
        </div>

        <div className="relative flex gap-6 w-full">
          <div className="relative w-[2px]">
            <div
              className="absolute left-0 w-[2px] h-[80px] bg-white transition-all duration-300"
              style={{ top: `${activeIndex * ITEM_HEIGHT}px` }}
            />
          </div>

          <div className="text-left w-full space-y-10">
            {features.map((item, index) => (
              <div
                key={index}
                className={`cursor-pointer transition-all duration-300 ${index === activeIndex ? "text-white" : "text-gray-400"
                  }`}
                onClick={() => setActiveIndex(index)}
              >
                <h3 className="text-xl md:text-3xl font-semibold">
                  {item.title}
                </h3>
                <p
                  className={`text-sm font-medium md:text-base ${index === activeIndex ? "text-gray-200" : "text-gray-500"
                    }`}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
