"use client";

import { Talktune } from "@/constants/Icons";
import { Bell, LogOut, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useStore } from "@/hooks/useStore";
import LogoutInfo from "./LogoutInfo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationPanel } from "./NotificationPanel";
import { useInView } from "react-intersection-observer";

const DashboardNavbar = () => {
  const { onOpen } = useStore();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const { ref, inView } = useInView();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useNotifications();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await apiClient.get('/api/user/profile');

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser({
              name: data.user.name,
              email: data.user.email,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Get first letter of name for avatar
  const getInitial = () => {
    if (!user?.name) return "U";
    return user.name.charAt(0).toUpperCase();
  };

  // Get first name for greeting
  const getFirstName = () => {
    if (!user?.name) return "User";
    return user.name.split(" ")[0];
  };

  return (
    <header className="h-[50px] md:h-[80px] px-6 w-full bg-white flex items-center justify-between">
      <h1 className="text-2xl hidden md:flex font-bold text-gray-800">
        Dashboard
      </h1>
      <Link href={"/"} className="md:hidden flex">
        <div className="relative h-[40px] z-10 w-[150px]">
          <Image src={Talktune} alt="Logo" fill className="object-contain" />
        </div>
      </Link>
      <div className="flex items-center space-x-4">
        <Search className="w-6 h-6 text-slate-700" />
        <Sheet>
          <SheetTrigger>
            <div className="relative">
              <div className="w-4 h-4 bg-gray-800 absolute rounded-full flex -top-2 -left-2 items-center justify-center">
                <span className="text-xs">3</span>
              </div>
              <Bell className="w-6 h-6 text-slate-700" />
            </div>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="text-2xl font-semibold">Notification</SheetTitle>
            </SheetHeader>
            {isLoading ? (
              <p>Loading...</p>
            ) : isError ? (
              <p>Error fetching notifications</p>
            ) : (
              <NotificationPanel
                notifications={data?.pages.flatMap((page) => page) ?? []}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage ?? false}
              />
            )}
            <div ref={ref} />
          </SheetContent>
        </Sheet>

        <div className="md:flex items-center hidden space-x-2">
          <div className="w-8 h-8 bg-orange-500 rounded-full relative flex items-center justify-center">
            <span className="absolute -top-1 -left-1 w-3 h-3 border-2 border-red-300 bg-red-500 rounded-full"></span>
            <span className="text-white text-sm font-medium">{loading ? "..." : getInitial()}</span>
          </div>
          <span className="text-gray-800 hidden md:flex font-medium">
            {loading ? "Loading..." : `Hi, ${getFirstName()}`}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <div className="w-8 h-8 md:hidden bg-orange-500 rounded-full relative flex items-center justify-center">
              <span className="absolute -top-1 -left-1 w-3 h-3 border-2 border-red-300 bg-red-500 rounded-full"></span>
              <span className="text-white text-sm font-medium">{loading ? "..." : getInitial()}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onOpen("modal", <LogoutInfo />)}
              className="flex outline-none focus:bg-red-50 focus:text-red-800 items-center space-x-2 py-2 px-4 hover:bg-red-50 text-red-800 font-medium"
            >
              <LogOut />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardNavbar;