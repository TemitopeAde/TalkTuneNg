"use client";

import { useStore } from "@/hooks/useStore";
import React from "react";

const PaymentModal = () => {
    const { isOpen, type, data } = useStore();

    if (!isOpen || type !== "payment") return null;

    return (
        <div className="fixed inset-0 h-screen w-screen z-50 bg-gray-900/80 backdrop-blur-sm flex justify-center items-center p-4">
            {data}
        </div>
    );
};

export default PaymentModal;