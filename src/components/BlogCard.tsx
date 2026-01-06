"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

const BlogCard = ({ item, idx }: { item: any; idx: number }) => {
  return (
    <Link
      href={`/blogs/${item.slug}`}
      key={idx}
      className="flex flex-col w-full max-w-[480px] p-4"
    >
      {/* ✅ Same width and height as Content page */}
      <div className="relative w-full h-[280px] lg:h-[300px] xl:h-[340px]">
        <Image
          src={item.coverImage}
          alt={item.title}
          fill
          className="object-cover rounded-2xl"
        />
      </div>

      <div className="flex flex-col w-full mt-4">
        <p className="text-sm text-gray-400">{item.category}</p>
        <h3 className="text-xl font-bold mt-2 text-white">{item.title}</h3>
        <span className="text-sm text-gray-300 mt-2 line-clamp-2">
          {item.excerpt}
        </span>
      </div>

      <div className="flex items-center space-x-3 mt-4">
        <h5 className="font-semibold text-white">{item.authorName}</h5>
      </div>
    </Link>
  );
};

export default BlogCard;
