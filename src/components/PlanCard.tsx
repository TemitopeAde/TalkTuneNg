"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import PrimaryBtn from "./buttons/PrimaryBtn";

interface PlanCardProps {
  title: string;
  subtitle: string;
  price: string;
  yearly: string;
  features: string[];
  active: boolean;
  onClick: () => void;
  className?: string;
}

export const PlanCard = ({
  title,
  subtitle,
  price,
  yearly,
  features,
  active,
  onClick,
  className = "",
}: PlanCardProps) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.42, 0, 0.58, 1] },
    },
  } as const;

  const displayPeriod = yearly.includes("yearly") ? "mo" : "yr";

  return (
    <motion.div
      onClick={onClick}
      className={cn(
        "ring-1 bg-background backdrop-blur-0 transition-all duration-200 ring-white/30 rounded-sm p-8 shrink-0 cursor-pointer",
        "w-full max-w-[400px]",
        active && "bg-accent",
        className
      )}
    >
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
        <h5 className="">{subtitle}</h5>
      </div>

      <div className="w-full h-[1px] bg-white my-6" />
      <div className="flex gap-6 flex-col">
        <span className="font-bold text-7xl">
          {price}
          <span className="text-4xl">/{displayPeriod}</span>
        </span>
        <span>{yearly}</span>
        <PrimaryBtn
          containerclass={cn(
            active && "bg-accent-foreground hover:bg-accent-forground"
          )}
          label="Get Started"
        />
      </div>
      <div className="w-full h-[1px] bg-white my-6" />
      <ul className="flex flex-col gap-4">
        {features.map((feature, index) => (
          <li key={index} className="flex space-x-4">
            <Check className="text-white h-6 w-6" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};