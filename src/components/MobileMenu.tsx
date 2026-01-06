"use client";

import React, { useState, useEffect } from "react";
import PrimaryBtn from "./buttons/PrimaryBtn";
import Logo from "./global/Logo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Talktune } from "@/constants/Icons";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter()

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [isOpen]);

  const navItems = [
    { name: "About", path: "/contact" },
    { name: "Pricing", path: "/pricing" },
    { name: "Blog", path: "/blogs" },
    { name: "Dashboard", path: "/dashboard" },
  ];

  return (
    <div className="relative z-50 bg-background bg-rose-500">
      <button
        onClick={toggleMenu}
        className="fixed top-4 right-4 z-50 py-4 pl-4 rounded-sm flex flex-col justify-center items-center space-y-1 hover:scale-110 ease-in-out"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <div
          className={`w-8 h-[3px] bg-white rounded-full transition-all duration-300 ease-in-out ${
            isOpen
              ? "rotate-45 translate-y-2 bg-white"
              : "rotate-0 translate-y-0"
          }`}
        />

        <div
          className={`w-8 h-[3px] bg-white rounded-full transition-all duration-300 ease-in-out ${
            isOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
          }`}
        />

        <div
          className={`w-8 h-[3px] bg-white rounded-full transition-all duration-300 ease-in-out ${
            isOpen
              ? "-rotate-45 -translate-y-2 bg-white"
              : "rotate-0 translate-y-0"
          }`}
        />
      </button>

      <div
        className={`fixed inset-0 h-screen bg-gray-900 bg-opacity-50 z-30 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleMenu}
      />

      <div
        className={`fixed top-0 right-0 h-screen w-4/5 bg-gradient-to-br from-gray-900 to-gray-800 z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full hidden"
        }`}
      >
        <nav className="p-6 h-full justify-center items-center flex flex-col">
          <Link href={"/"} onClick={toggleMenu} className="relative h-[40px] z-10 w-[150px]">
            <Image src={Talktune} alt="Logo" fill className="object-contain" />
          </Link>
          <ul className="space-y-6 justify-center flex flex-col h-full items-center">
            {navItems.map((item, index) => (
              <li key={item.name}>
                <Link
                  href={item.path}
                  onClick={toggleMenu}
                  className={cn(
                    "block py-4 px-6 text-2xl  hover:text-accent-foreground rounded-lg transition-all duration-200 transform hover:scale-105",
                    isOpen
                      ? `animate-slideIn opacity-100`
                      : "opacity-0 translate-x-8",
                    pathname === item.path
                      ? "text-accent-foreground"
                      : "text-foreground"
                  )}
                  style={{
                    animationDelay: isOpen ? `${index * 100}ms` : "0ms",
                  }}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <PrimaryBtn onClick={()=>router.push("/auth/register")} label="Get Early Access" />
          </div>
        </nav>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(2rem);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MobileMenu;
