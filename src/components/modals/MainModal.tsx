"use client";

import { useStore } from "@/hooks/useStore";
import React from "react";

const MainModal = () => {
  const { isOpen, type, data, onClose } = useStore();
  if (!isOpen || type !== "modal") return;
  return (
    <div className="fixed h-screen w-screen z-40 bg-gray-900/50 backdrop-blur-sm justify-center items-center flex">
      <div className="z-40 w-full h-full bg-background ring-2 ring-white rounded-2xl max-w-5xl max-h-[90vh] md:max-h-[85vh] backdrop-blur-sm justify-center items-center flex overflow-y-auto custom-scrollbar">
        {data}
      </div>
      <div
        onClick={() => onClose()}
        className="h-full cursor-pointer w-full absolute"
      />
    </div>
  );
};

export default MainModal;
