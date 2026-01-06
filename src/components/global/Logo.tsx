import { Talktune } from "@/constants/Icons";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <Link href={"/"} className="relative h-[40px] z-10 w-[150px]">
      <Image src={Talktune} alt="Logo" fill className="object-contain" />
    </Link>
  );
};

export default Logo;
