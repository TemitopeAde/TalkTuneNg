"use client";

import { features2 } from "@/constants/Image";
import { cn } from "@/lib/utils";
import { ArrowLeftCircle, ArrowRightCircle, Star } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

const Testimonials = () => {
  const containerRef = useRef<any>(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry: any) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.dataset.index);
            setCurrentIndex(index);
          }
        });
      },
      {
        root: el,
        threshold: 0.5,
      }
    );

    const children = el.querySelectorAll(".testimonial-card");
    children.forEach((child: any, idx: number) => {
      child.dataset.index = idx;
      observer.observe(child);
    });

    return () => observer.disconnect();
  }, []);

  const scrollLeft = () => {
    containerRef.current?.scrollBy({ left: -620, behavior: "smooth" });
  };

  const scrollRight = () => {
    containerRef.current?.scrollBy({ left: 620, behavior: "smooth" });
  };
  return (
    <section className="relative rounded-t-[64px] bg-background py-20 h-full flex w-full overflow-hidden justify-center md:items-center flex-col text-white">
      <div className="flex flex-col p-6">
        <h2 className="uppercase font-semibold text-base md:text-2xl text-left md:text-center">
          user feedback
        </h2>
        <h2 className="font-bold text-3xl md:text-5xl md:text-center">
          Helping creators achieve their goals
        </h2>
      </div>
      <div
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory px-6 gap-6 scrollbar-hide w-full mt-4 md:mt-6"
      >
        {Array(6)
          .fill(0)
          .map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "testimonial-card snap-center shrink-0 w-full md:w-[600px] rounded-[16px] p-8 transition-all duration-300",
                currentIndex === idx
                  ? "bg-accent opacity-100 ring-1 ring-white ring-inset"
                  : "bg-[#ffffff14] opacity-40"
              )}
            >
              {/* <div
                className={cn(
                  "ring-1 min-w-[600px] overflow-hidden flex flex-col w-auto ring-white ring-inset rounded-[16px] p-8 bg-accent",
                  idx === 0 && "ml-6",
                  "bg-transparent"
                )}
              > */}
              <div className="flex gap-1">
                <Star fill="white" />
                <Star fill="white" />
                <Star fill="white" />
                <Star fill="white" />
                <Star fill="white" />
              </div>
              <p className="mt-4">
                "A customer testimonial that highlights features and answers
                potential customer doubts about your product or service.
                Showcase testimonials from a similar demographic to your
                customers."
              </p>
              <div className="flex space-x-4 mt-4">
                <div className="relative h-[56px] w-[56px]">
                  <Image
                    src={features2}
                    alt="Review"
                    fill
                    className="rounded-full as object-cover"
                  />
                </div>

                <div>
                  <h5 className="font-semibold">Name Surname</h5>
                  <h5>Position, Company name</h5>
                </div>
              </div>
              {/* </div> */}
            </div>
          ))}
      </div>

      <div className="flex mt-12 gap-6 items-center justify-center">
        <button onClick={scrollLeft}>
          <ArrowLeftCircle strokeWidth={1} size={48} />
        </button>
        <button onClick={scrollRight}>
          <ArrowRightCircle strokeWidth={1} size={48} />
        </button>
      </div>
    </section>
  );
};

export default Testimonials;
