"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mic, Spiral } from "@/constants/Icons";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import Logo from "@/components/global/Logo";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center px-6 md:px-[100px] overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 w-[400px] h-[60vh] opacity-30">
        <Image src={Mic} fill alt="Mic" className="object-contain" />
      </div>
      <div className="fixed w-full -bottom-20 justify-end flex items-end h-[600px] opacity-30">
        <Image src={Spiral} alt="Spiral" fill className="object-cover" />
      </div>
      <div
        className="w-1/2 h-[400px] bg-[#A8EF4370] rounded-full absolute -top-20
             transform blur-[200px] -z-1"
      />

      {/* Logo */}
      <div className="absolute top-8 left-8">
        <Logo />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6 max-w-2xl">
        {/* 404 Number */}
        <div className="relative">
          <h1 className="text-[120px] md:text-[180px] font-bold text-white/10 leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white">
              Page Not Found
            </h2>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <p className="text-lg md:text-xl text-gray-300 max-w-md">
            Oops! The page you&apos;re looking for seems to have wandered off into the void.
          </p>
          <p className="text-base text-gray-400">
            Don&apos;t worry, even the best voiceovers sometimes miss their cue.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <PrimaryBtn
            label="Go Home"
            onClick={() => router.push("/")}
            containerclass="min-w-[150px]"
          />
          <button
            onClick={() => router.back()}
            className="bg-white/10 hover:bg-white/20 transition-all duration-300
                     backdrop-blur-sm rounded-[8px] py-3 px-5 min-w-[150px]
                     ring-1 ring-white/20"
          >
            <h4 className="text-white text-base font-medium">Go Back</h4>
          </button>
        </div>

        {/* Decorative badge */}
        <div className="mt-12 ring-1 ring-white/20 rounded-[4px] px-4 py-2 bg-white/5 backdrop-blur-sm">
          <span className="text-white/70">Error Code: 404</span>
        </div>
      </div>
    </div>
  );
}
