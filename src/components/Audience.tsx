"use client";

import { motion } from "framer-motion";
import { Trend } from "@/constants/Icons";
import Image from "next/image";
import React from "react";

const data = [
  {
    id: 1,
    title: "Ease to use",
    detail: "Making it accessible to both beginners and professionals.",
  },
  {
    id: 2,
    title: "Engage your Audience",
    detail: "Effortlessly create marketing voiceovers that captivate.",
  },
  {
    id: 3,
    title: "Safe and Secure",
    detail:
      "All projects, personal information and payment details are protected.",
  },
  {
    id: 4,
    title: "Ease to use",
    detail: "Making it accessible to both beginners and professionals.",
  },
  {
    id: 5,
    title: "Engage your Audience",
    detail: "Effortlessly create marketing voiceovers that captivate.",
  },
  {
    id: 6,
    title: "Safe and Secure",
    detail:
      "All projects, personal information and payment details are protected.",
  },
];

const Audience = () => {
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
  } as const

  return (
    <div className="bg-white py-8 w-full text-black px-6 md:px-[100px] h-full">
      <h2 className="text-[28px] md:text-[35px] font-bold text-center">
        Transform Your Creations: Authentic <br className="md:flex hidden" />
        Accents, Multilingual Options.
      </h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full"
      >
        {data.map((item) => (
          <motion.div
            variants={cardVariants}
            key={item.id}
            className="w-[340px] p-4"
          >
            <Image src={Trend} alt="Trend" height={56} width={56} />
            <h3 className="font-semibold text-2xl">{item.title}</h3>
            <span>{item.detail}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Audience;