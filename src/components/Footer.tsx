import React from "react";
import Logo from "./global/Logo";
import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Instagram,
  LinkedIn,
  Twitter,
} from "@/constants/Icons";

const Footer = () => {
  return (
    <div className="w-full bg-background items-center z-10 pb-10 px-6 md:px-[100px]">
      <div className="h-[1px]  w-full bg-white/30 mb-[33px]" />
      <div className="flex flex-col md:flex-row gap-6 w-full md:justify-between md:items-center">
        <Logo />
        <ul className="flex md:flex-row flex-col gap-6">
          <li>
            <Link href={"/contact"} className="font-medium z-10 text-base text-foreground">
              About
            </Link>
          </li>
          <li>
            <Link href={"/pricing"} className="font-medium text-base text-foreground">
              Pricing
            </Link>
          </li>
          <li>
            <Link href={"/blogs"} className="font-medium text-base text-foreground">
              Blog
            </Link>
          </li>
        </ul>
        <div className="flex items-center space-x-6">
          {/* <Link target="_blank" href={""}>
            <Image src={Facebook} alt="Facebook" height={12} width={12} />
          </Link> */}
          <Link target="_blank" href={"https://www.instagram.com/talktune_hq?igsh=MTU2Y3ZiNG9pZ21saQ=="}>
            <Image src={Instagram} alt="Instagram" height={24} width={24} />
          </Link>
          {/* <Link target="_blank" href={""}>
            <Image src={Twitter} alt="Twitter" height={24} width={24} />
          </Link> */}
          <Link target="_blank" href={"https://www.linkedin.com/in/talktune-org-0b6894309?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"}>
            <Image src={LinkedIn} alt="LinkedIn" height={24} width={24} />
          </Link>
        </div>
      </div>
      <div className="flex md:flex-row flex-col justify-center gap-6 mt-4 w-full items-start md:items-center">
        <span>&copy; 2025 Talktune. All rights reserved</span>
        <div className="flex justify-start items-center flex-wrap gap-4">
          <Link href={"#"} className="underline">
            Privacy Policy
          </Link>
          <Link href={"#"} className="underline">
            Terms of Service
          </Link>
          <Link href={"#"} className="underline">
            Cookies Settings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;
