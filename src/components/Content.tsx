"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useState } from "react";
import { Spiral } from "@/constants/Icons";
import { useBlogs } from "@/hooks/useBlog";

const Content = () => {
  const [tab, setTab] = useState("view-all");
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Limit to 6 posts
  const { data, isLoading, error } = useBlogs({
    page: currentPage,
    limit: 6,
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
    <div className="relative rounded-b-[64px] pt-[200px] bg-background pb-20 h-full flex flex-col w-full px-6 md:px-[100px] overflow-hidden justify-center text-white mt-[64px]">
      {/* ✅ Spiral centered */}
      <div className="fixed inset-0 flex justify-center items-center h-[600px] pointer-events-none">
        <Image src={Spiral} alt="Spiral" fill className="object-contain opacity-40" />
      </div>

      <div
        className="w-1/2 h-[400px] bg-[#A8EF4370] rounded-full absolute -top-20 
        transform blur-[200px] -z-1"
      />

      <div className="flex justify-center items-center">
        <div>
          <p className="uppercase text-sm tracking-widest text-gray-300 font-semibold text-center">
            Use case
          </p>
          <h2 className="text-[28px] md:text-[40px] font-bold text-left mb-6">
            Content with Talktune
          </h2>

          <div className="flex justify-center space-x-4 text-white font-semibold overflow-auto scrollbar-hide mt-4">
            <button
              onClick={() => {
                setTab("view-all");
                setCurrentPage(1);
              }}
              className={cn(
                "relative overflow-hidden px-6 py-3 group transition-all duration-300",
                tab === "view-all"
                  ? "border border-white"
                  : "border border-transparent"
              )}
            >
              <span className="relative font-medium text-white">View All</span>
              <span className="absolute inset-0 z-0 scale-y-0 origin-bottom bg-accent transition-transform duration-500 ease-in-out group-hover:scale-y-100" />
            </button>

            <button
              onClick={() => {
                setTab("category");
                setCurrentPage(1);
              }}
              className={cn(
                "relative overflow-hidden px-6 py-3 group transition-all duration-300",
                tab === "category"
                  ? "border border-white"
                  : "border border-transparent"
              )}
            >
              <span className="relative font-medium text-white">Category</span>
              <span className="absolute inset-0 z-0 scale-y-0 origin-bottom bg-accent transition-transform duration-500 ease-in-out group-hover:scale-y-100" />
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Larger cards with consistent layout */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 mt-10 justify-items-center"
      >
        {data?.data.blogs?.slice(0, 6).map((item: any, idx: number) => (
          <motion.div
            variants={cardVariants}
            key={idx}
            className="relative w-full max-w-[480px] h-[280px] lg:h-[300px] xl:h-[340px]"
          >
            <Image
              src={item.coverImage}
              alt={`Feature ${idx + 1}`}
              fill
              className="object-cover rounded-2xl"
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Content;
