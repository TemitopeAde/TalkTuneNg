"use client";

import { Spiral } from "@/constants/Icons";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { ArrowLeftCircle, ArrowRightCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlanCard } from "../PlanCard";
import { motion } from "framer-motion";

const basePlans = [
  {
    key: "creator",
    title: "Creator Plan",
    subtitle: "Great for regular content creators.",
    monthlyPrice: 8,
    features: [
      "Up to 50 voiceovers per month",
      "Access to full voice library",
      "Script limit: 2,500 characters",
      "Auto-optimize audio for Instagram/TikTok/YouTube length.",
    ],
  },
  {
    key: "pro",
    title: "Pro Plan",
    subtitle: "Professional tools for high-quality audio.",
    monthlyPrice: 13,
    features: [
      "Unlimited voiceovers",
      "Priority processing",
      "Advanced editing & custom tone/emotion",
      "Multi-language & accent support",
      "AI scriptwriting assistant (basic)",
      "Multi-format export: MP3, WAV, and direct export to video editors (Canva, CapCut, etc.).",
      "Script limit: 5,000 characters",
    ],
  },
  {
    key: "business",
    title: "Business Plan",
    subtitle: "For teams and businesses.",
    monthlyPrice: 48,
    features: [
      "Everything in Pro",
      "Team collaboration (multi-user access)",
      "Background music integration",
      "API access for integrations",
      "Advanced analytics & usage reports",
      "Script limit: 10,000 characters",
      "Premium customer support",
      "Collaboration features: Commenting, approvals, and version history.",
    ],
  },
];

const PricingHero = () => {
  const [tab, setTab] = useState<"monthly" | "yearly">("monthly");
  const [plan, setPlan] = useState("creator");

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = (index: number) => {
    const container = scrollRef.current;
    if (container) {
      const child = container.children[index] as HTMLElement;
      child?.scrollIntoView({ behavior: "smooth", inline: "center" });
    }
  };

  const getVisibleIndex = () => {
    const container = scrollRef.current;
    if (!container) return 0;

    const children = Array.from(container.children) as HTMLElement[];
    const containerLeft = container.scrollLeft;
    let closestIdx = 0;
    let minDistance = Infinity;

    children.forEach((child, index) => {
      const distance = Math.abs(child.offsetLeft - containerLeft);
      if (distance < minDistance) {
        minDistance = distance;
        closestIdx = index;
      }
    });

    return closestIdx;
  };

  const scrollLeft = () => {
    const index = getVisibleIndex();
    const newIndex = Math.max(0, index - 1);
    scrollToIndex(newIndex);
    setPlan(basePlans[newIndex].key);
  };

  const scrollRight = () => {
    const index = getVisibleIndex();
    const newIndex = Math.min(basePlans.length - 1, index + 1);
    scrollToIndex(newIndex);
    setPlan(basePlans[newIndex].key);
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const index = getVisibleIndex();
      setPlan(basePlans[index].key);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const plans = basePlans.map((basePlan) => {
    const displayPrice = tab === "monthly" ? basePlan.monthlyPrice : basePlan.monthlyPrice * 12;
    const displayPeriod = tab === "monthly" ? "mo" : "yr";
    const alternative = tab === "monthly" 
      ? `or $${basePlan.monthlyPrice * 12} yearly` 
      : `or $${basePlan.monthlyPrice} monthly`;
    return {
      ...basePlan,
      price: `$${displayPrice}`,
      yearly: alternative,
    };
  });

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.42, 0, 0.58, 1] },
    },
  } as const;

  return (
    <section className="relative rounded-b-[64px] pt-[200px]  bg-background pb-20 h-full flex w-full px-6 md:px-[100px] overflow-hidden justify-center items-center flex-col text-white">
      <div className="absolute w-full -bottom-20 justify-end flex items-end h-[600px]">
        <Image src={Spiral} alt="Spiral" fill className="object-cover" />
      </div>
      <div
        className="w-1/2 h-[400px] bg-[#A8EF4370] rounded-full absolute -top-20 
             transform blur-[200px] -z-1"
      />

      <div className="flex flex-col justify-center items-center gap-4 mb-28">
        <h3 className="uppercase font-semibold text-base md:text-2xl text-center">
          No contracts, No surprises
        </h3>
        <h3 className="font-bold text-3xl max-w-3xl text-center md:text-5xl">
          We have the perfect plans for your needs
        </h3>

        <div className="flex space-x-4 items-center mt-6 justify-center">
          <button
            onClick={() => setTab("monthly")}
            className={cn(
              "relative overflow-hidden px-6 py-3 ring-0 ring-white group",
              tab === "monthly" && "ring-1"
            )}
          >
            <span className="relative font-medium text-white">Monthly</span>
            <span className="absolute inset-0 z-0 scale-y-0 origin-bottom bg-accent transition-transform duration-500 ease-in-out group-hover:scale-y-100" />
          </button>
          <button
            onClick={() => setTab("yearly")}
            className={cn(
              "relative overflow-hidden px-6 py-3 ring-0 ring-white group",
              tab === "yearly" && "ring-1"
            )}
          >
            <span className="relative font-medium text-white">Yearly</span>
            <span className="absolute inset-0 z-0 scale-y-0 origin-bottom bg-accent transition-transform duration-500 ease-in-out group-hover:scale-y-100" />
          </button>
        </div>
      </div>
      <div className="relative w-full max-w-6xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          // whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth gap-4 px-4 lg:grid lg:grid-cols-3 lg:overflow-visible"
        >
          {plans.map((item) => (
            <PlanCard
              key={item.key}
              title={item.title}
              subtitle={item.subtitle}
              price={item.price}
              yearly={item.yearly}
              features={item.features}
              active={plan === item.key}
              onClick={() => setPlan(item.key)}
              className="snap-center min-w-full sm:min-w-[400px] lg:min-w-0"
            />
          ))}
        </motion.div>
        <div className="flex mt-4 gap-6 items-center justify-center lg:hidden">
          <button onClick={scrollLeft}>
            <ArrowLeftCircle strokeWidth={1} size={48} />
          </button>
          <button onClick={scrollRight}>
            <ArrowRightCircle strokeWidth={1} size={48} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PricingHero;