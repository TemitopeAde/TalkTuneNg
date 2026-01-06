import { Talktune } from "@/constants/Icons";
import { AuthBanner } from "@/constants/Image";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const AuthenticationLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex flex-1 min-h-screen gap-6 w-full bg-background relative">
      <Link href={"/"}>
        <div className="absolute w-40 h-14 top-6 right-6 z-50">
          <Image src={Talktune} alt="Logo" fill className="object-contain" />
        </div>
      </Link>
      <div className="md:flex flex-1 relative h-screen w-full hidden">
        <Image
          src={AuthBanner}
          alt="Authentication Banner"
          className="absolute inset-0 object-cover w-full h-full"
          priority
          fill
        />
      </div>
      <div className="flex-1 flex justify-center items-center">
        {/* <AuthModal /> */}
        {children}
      </div>
    </main>
  );
};

export default AuthenticationLayout;
