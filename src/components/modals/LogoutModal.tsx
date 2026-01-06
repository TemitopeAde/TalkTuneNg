"use client";

import { useStore } from "@/hooks/useStore";
import React from "react";

const LogoutModal = () => {
  const { isOpen, type, data, onClose } = useStore();
  if (!isOpen || type !== "logout") return;
  return (
    <div className="fixed h-screen w-screen z-40 bg-gray-900/50 backdrop-blur-sm justify-center items-center flex">
      <div className="z-40 w-full h-full bg-background ring-2 ring-white rounded-2xl max-w-xl max-h-[40vh] md:max-h-[40vh] backdrop-blur-sm justify-center items-center flex">
        {data}
      </div>
      <div onClick={() => onClose()} className="h-full cursor-pointer w-full absolute" />


    </div>
  );
};

export default LogoutModal;
