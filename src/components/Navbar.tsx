'use client'

import React from "react";
import Logo from "./global/Logo";
import Link from "next/link";
import PrimaryBtn from "./buttons/PrimaryBtn";
import MobileMenu from "./MobileMenu";
import { usePathname, useRouter } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter()

  const navItems = [
    { name: "About", path: "/contact" },
    { name: "Pricing", path: "/pricing" },
    { name: "Blog", path: "/blogs" },
    { name: "Dashboard", path: "/dashboard" },
  ];
  return (
    <nav className="flex gap-4 backdrop-blur-lg z-10 px-6 md:px-[100px] bg-transparent items-center pt-4 justify-between w-full">
      <Logo />
      <div
        className="w-[100px] md:w-[200px] left-1/2 h-40 bg-accent rounded-full absolute 
             transform blur-[100px] -z-30"
      />
      <ul className="hidden md:flex gap-6">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              href={item.path}
              className={`font-medium z-10 transition-all ease-in-out duration-300 text-base ${
                pathname === item.path
                  ? "text-accent-foreground" // active
                  : "text-foreground" // inactive
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
      
      <div className="md:flex hidden">
        <PrimaryBtn onClick={()=>router.push("/auth")} label="Get Early Access" />
      </div>

      <div className="flex md:hidden cursor-pointer">
        {/* <Menu className="text-white h-10 w-10"/> */}
        <MobileMenu />
      </div>
    </nav>
  );
};

export default Navbar;
