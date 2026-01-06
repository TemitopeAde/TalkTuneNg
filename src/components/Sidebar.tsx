"use client";

import React, { useEffect, useState } from "react";
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
import { apiClient } from "@/lib/api-client";

const Sidebar = () => {
  const { onOpen } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get('/api/user/profile');
        if (res.ok) {
          const json = await res.json();
          setIsAdmin(json?.user?.role === 'ADMIN');
        }
      } catch {}
    };
    load();
  }, []);

  const sidebarItems = [
    { id: "home", icon: Home, label: "Home", path: "/dashboard" },
    {
      id: "script",
      icon: FileText,
      label: "Script",
      path: "/dashboard/scripts",
    },
    ...(isAdmin ? [{ id: "blogs", icon: FileText, label: "Blogs", path: "/dashboard/blogs" } as const] : []),
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
    {
      id: "support",
      icon: HelpCircle,
      label: "Support",
      path: undefined,
    },
    {
      id: "logout",
      icon: LogOut,
      label: "Logout",
      path: undefined,
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
    <aside className="w-72  bg-background hidden md:flex flex-col fixed h-screen border-r-4  border-[#6b952a]">
      <div className="p-6  border-b border-slate-700 ">
        <Link href={"/"}>
          <div className="relative h-[40px] z-10 w-[150px]">
            <Image src={Talktune} alt="Logo" fill className="object-contain" />
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-4 mr-4">
        <ul className="space-y-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() =>
                    item.id === "logout"
                      ? handleLogout()
                      : item.id === "support"
                      ? handleSupport()
                      : handleNavClick(item)
                  }
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-sm transition-all duration-300 ${
                    pathname === item.path
                      ? "bg-white text-slate-900 ml-4"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      item.id === "logout" && "text-red-600"
                    )}
                  />
                  <span
                    className={cn(
                      "font-medium",
                      item.id === "logout" && "text-red-600"
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
