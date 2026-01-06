"use client";

import React, { useState } from "react";
import {
  Home,
  FileText,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { Talktune } from "@/constants/Icons";
import { useStore } from "@/hooks/useStore";
import UploadScript from "./UploadScript";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import LogoutInfo from "./LogoutInfo";
import { cn } from "@/lib/utils";
import Support from "./Support";

const Bottombar = () => {
  const { onOpen } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const sidebarItems = [
    { id: "home", icon: Home, label: "Home", path: "/dashboard" },
    {
      id: "script",
      icon: FileText,
      label: "Script",
      path: "/dashboard/scripts",
    },
    {
      id: "subscription",
      icon: CreditCard,
      label: "Subscription",
      path: "/dashboard/subscriptions",
    },
    {
      id: "settings",
      icon: Settings,
      label: "Settings",
      path: "/dashboard/settings",
    },
  ];

  const handleLogout = () => {
    onOpen("logout", <LogoutInfo />);
  };

  const handleSupport = () => {
    onOpen("modal", <Support />);
  };

  const handleNavClick = (item: any) => {
    router.push(item.path);
  };

  return (
    <div
      style={{
        zIndex: 1000,
      }}
      className="md:hidden flex fixed bottom-0 left-0 right-0 w-full"
    >
      {/* Main bottom bar container */}
      <div className="flex w-full bg-background border-t border-accent-foreground rounded-t-md min-h-[60px]">
        <ul className="flex w-full justify-evenly items-center py-3">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <li 
                key={item.id} 
                className={cn(
                  "flex justify-center items-center flex-1 relative",
                  // Add border separator except for the last item
                  index < sidebarItems.length - 1 && "after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:h-6 after:w-px after:bg-gray-300/30"
                )}
              >
                <button
                  onClick={() => handleNavClick(item)}
                  className={`flex items-center justify-center p-3 rounded-lg transition-all duration-300 ${
                    pathname === item.path
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6",
                      item.id === "logout" && "text-red-400"
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Bottombar;