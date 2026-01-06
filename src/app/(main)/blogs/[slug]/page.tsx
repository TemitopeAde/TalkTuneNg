"use client";

import BlogCard from "@/components/BlogCard";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import { Facebook, LinkedIn, Twitter, UrlLink } from "@/constants/Icons";
import { ChevronLeft, Dot, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useBlog, useBlogs } from "@/hooks/useBlog";
import { useParams } from "next/navigation";

const Page = () => {
  const params = useParams();
  const slug = params.slug as string;

  const { data: blogData, isLoading: blogLoading, error: blogError } = useBlog(slug);
  const { data: relatedData, isLoading: relatedLoading } = useBlogs({ limit: 3 });

  const blog = blogData?.data;
  const relatedBlogs = relatedData?.data?.blogs?.filter((b: any) => b.slug !== slug) || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short', 
      year: 'numeric' 
    });
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const formatContent = (content: string) => {
    return content
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3 text-gray-900">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .split('\n\n')
      .map(paragraph => {
        if (paragraph.startsWith('<h')) {
          return paragraph;
        }
        
        // Handle bullet lists
        if (paragraph.includes('\n- ')) {
          const items = paragraph.split('\n')
            .filter(line => line.trim().startsWith('- '))
            .map(item => `<li class="ml-4 mb-2">${item.substring(2)}</li>`)
            .join('');
          return `<ul class="list-disc list-inside mb-6 ml-4">${items}</ul>`;
        }
        
        // Handle single bullet points
        if (paragraph.startsWith('- ')) {
          return `<ul class="list-disc list-inside mb-6 ml-4"><li class="ml-4 mb-2">${paragraph.substring(2)}</li></ul>`;
        }
        
        return paragraph.trim() ? `<p class="mb-4">${paragraph}</p>` : '';
      })
      .join('');
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (blogLoading) {
    return (
      <div className="flex flex-col justify-center min-h-screen bg-background -mt-16 items-center w-full h-full">
        <section className="relative max-sm:-mt-20 pt-[200px] grid grid-cols-1 md:grid-cols-2 bg-background pb-20 h-full w-full px-6 md:px-[100px] overflow-hidden justify-center items-center flex-col text-white animate-pulse">
          <div className="flex flex-1 flex-col space-y-8 w-full">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-7 w-7 bg-slate-700 rounded"></div>
              <div className="h-6 w-24 bg-slate-700 rounded"></div>
            </div>

            <div className="h-12 w-3/4 bg-slate-700 rounded mb-4"></div>

            <div className="space-y-2">
              <div className="h-5 w-32 bg-slate-700 rounded"></div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-24 bg-slate-700 rounded"></div>
                <div className="h-5 w-20 bg-slate-700 rounded"></div>
              </div>
            </div>

            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-10 bg-slate-700 rounded-full"></div>
              ))}
            </div>
          </div>

          <div className="flex-1 relative h-[400px] w-full bg-slate-700 rounded-xl"></div>
        </section>
      </div>
    );
  }

  if (blogError || !blog) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-red-500 text-xl">Blog not found</p>
          <Link href="/blogs" className="mt-4 inline-block text-white underline">
            Back to all blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center min-h-screen bg-background -mt-16 items-center w-full h-full">
      <section className="relative max-sm:-mt-20 pt-[200px] grid grid-cols-1 md:grid-cols-2 bg-background pb-20 h-full w-full px-6 md:px-[100px] overflow-hidden justify-center items-center flex-col text-white">
        <div
          className="w-1/2 h-full bg-[#A8EF4370] rounded-full absolute
             transform blur-[400px] -translate-x-1/2 -left-10 -z-1"
        />

        <div className="flex flex-1 flex-col space-y-8">
          <a href={"/blogs"} className="flex cursor-pointer items-center gap-2 mb-6">
            <ChevronLeft className="text-white h-7 w-7" />
            <span className="text-white">All Posts</span>
          </a>

          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {blog.title}
          </h1>

          <div>
            <p>By {blog.authorName}</p>
            <div className="flex items-center text-gray-300">
              <span>{formatDate(blog.createdAt)}</span>
              <Dot className="inline" />
              <span>{calculateReadTime(blog.content)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold">Share this post</h4>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="flex items-center justify-center h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                title="Copy link"
              >
                <Image src={UrlLink} alt="Copy link" height={18} width={18} />
              </button>
              <Link
                target="_blank"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                className="flex items-center justify-center h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Image src={Facebook} alt="Facebook" height={12} width={12} />
              </Link>
              <Link
                target="_blank"
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(blog.title)}`}
                className="flex items-center justify-center h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Image src={Twitter} alt="Twitter" height={24} width={24} />
              </Link>
              <Link
                target="_blank"
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                className="flex items-center justify-center h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Image src={LinkedIn} alt="LinkedIn" height={24} width={24} />
              </Link>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center flex-1 flex-col space-y-4 mt-10 md:mt-0">
          <div className="relative w-full h-[400px] md:h-[500px]">
            <Image
              src={blog.coverImage}
              alt={blog.title}
              fill
              className="rounded-lg object-cover"
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col items-start justify-start w-full px-6 md:px-[100px] min-h-screen py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <div 
              className="text-gray-700 text-lg leading-relaxed blog-content"
              dangerouslySetInnerHTML={{
                __html: formatContent(blog.content)
              }}
            />
          </div>

          <div className="flex items-center space-x-4 mt-12 pt-8 border-t border-gray-200">
            <div>
              <h4 className="font-bold text-gray-900">{blog.authorName}</h4>
            </div>
          </div>
        </div>
      </div>

      <section className="relative bg-background pb-20 h-full w-full px-6 md:px-[100px] overflow-hidden flex-col text-white">
        <div
          className="w-1/2 h-full bg-[#A8EF4370] rounded-full absolute
             transform blur-[400px] -translate-x-1/2 -left-10 -z-1"
        />

        <div className="pt-[100px] flex justify-between items-center">
          <h2 className="text-3xl md:text-5xl font-bold">Related Posts</h2>
          <Link href="/blogs">
            <PrimaryBtn label="View all" />
          </Link>
        </div>

        {relatedLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        ) : relatedBlogs.length > 0 ? (
          <div className="flex w-full space-x-4 overflow-auto scrollbar-hide gap-6 mt-8">
            {relatedBlogs.map((item: any, idx: number) => (
              <BlogCard key={item.id} item={item} idx={idx} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-20">No related posts found</p>
        )}
      </section>
    </div>
  );
};

export default Page;