"use client";

import Testimonials from "@/components/Testimonials";
import { Spiral } from "@/constants/Icons";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useState } from "react";
import Contact from "@/components/Contact";
import BlogCard from "@/components/BlogCard";

import { Loader2 } from "lucide-react";
import { useBlogs } from "@/hooks/useBlog";

const Page = () => {
  const [tab, setTab] = useState("view-all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useBlogs({ 
    category: tab, 
    page: currentPage, 
    limit: 9 
  });

  const blogs = data?.data?.blogs || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="flex flex-col justify-center bg-background items-center w-full h-full">
      <section className="relative rounded-b-[64px] -top-16 pt-[200px]  bg-background pb-20 h-full flex w-full px-6 md:px-[100px] overflow-hidden justify-center items-center flex-col text-white">
        <div className="fixed w-full -bottom-20 justify-end flex items-end h-[600px]">
          <Image src={Spiral} alt="Spiral" fill className="object-cover" />
        </div>
        <div
          className="w-1/2 h-[400px] bg-[#A8EF4370] rounded-full absolute -top-20 
             transform blur-[200px] -z-1"
        />
        <div className="flex flex-col justify-center items-center gap-4 mb-28">
          <h3 className="uppercase font-semibold text-base md:text-2xl text-center">
            Blogs
          </h3>
          <h3 className="font-bold text-3xl max-w-3xl text-center md:text-5xl">
            Read Our Blogs
          </h3>

          <div className="flex space-x-4 items-center mt-6 justify-center">
            <button
              onClick={() => {
                setTab("view-all");
                setCurrentPage(1);
              }}
              className={cn(
                "relative overflow-hidden px-6 py-3 ring-0 ring-white group",
                tab === "view-all" && "ring-1"
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
                "relative overflow-hidden px-6 py-3 ring-0 ring-white group",
                tab === "category" && "ring-1"
              )}
            >
              <span className="relative font-medium text-white">Category</span>
              <span className="absolute inset-0 z-0 scale-y-0 origin-bottom bg-accent transition-transform duration-500 ease-in-out group-hover:scale-y-100" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 w-full xl:grid-cols-3 gap-6 max-sm:mt-6">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-slate-800 rounded-lg overflow-hidden">
                  <div className="h-48 bg-slate-700"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 w-24 bg-slate-700 rounded"></div>
                    <div className="h-6 w-full bg-slate-700 rounded"></div>
                    <div className="h-4 w-full bg-slate-700 rounded"></div>
                    <div className="h-4 w-3/4 bg-slate-700 rounded"></div>
                    <div className="flex items-center justify-between pt-4">
                      <div className="h-4 w-20 bg-slate-700 rounded"></div>
                      <div className="h-8 w-24 bg-slate-700 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-500 p-6 text-center min-h-[400px] flex items-center justify-center">
            <div>
              <p className="text-red-500">{error instanceof Error ? error.message : 'An error occurred'}</p>
            </div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="rounded-lg border border-[#6b952a] p-12 text-center min-h-[400px] flex items-center justify-center">
            <div>
              <p className="text-gray-400 text-lg">No blogs found</p>
              <p className="text-gray-500 text-sm mt-2">Check back later for new content</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 w-full xl:grid-cols-3 gap-6 max-sm:mt-6">
              {blogs.map((item: any, idx: number) => (
                <BlogCard key={item.id} item={item} idx={idx} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4 mt-12">
                <button
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-6 py-2 bg-white text-slate-900 rounded-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-white">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-6 py-2 bg-white text-slate-900 rounded-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <Testimonials />
      <Contact />
    </div>
  );
};

export default Page;