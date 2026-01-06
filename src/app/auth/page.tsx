"use client"

import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import { useRouter } from "next/navigation";
import React from "react";

const Page = () => {
  const router = useRouter()

  return (
    <div className="flex min-w-md max-w-lg flex-col px-4 items-start justify-center h-screen gap-6">
      <h1 className="text-4xl md:text-5xl font-bold">
        Bringing Your Stories to Life with Innovative AI Voice Technology
      </h1>
      <p className="text-base text-gray-300 md:text-lg text-wrap">
        Transform your scripts into professional voiceovers in seconds. Just
        type, select, and listen.
      </p>
      <PrimaryBtn  onClick={()=>router.push("/auth/register")} containerclass="w-[300px]" label="Get Started" />
    </div>
  );
};

export default Page;
