"use client"

import React from "react";
import { ArrowLeft, Edit3, Trash2, Plus, ChevronLeft } from "lucide-react";
import { useStore } from "@/hooks/useStore";

interface PaymentMethod {
  id: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  nextBillingDate: string;
  cardType: "mastercard" | "visa" | "amex";
}

interface BillingDetailsProps {
  onBack?: () => void;
  onEditCard?: (cardId: string) => void;
  onDeleteCard?: (cardId: string) => void;
  onAddNewCard?: () => void;
}

const BillingDetails: React.FC<BillingDetailsProps> = ({
  onBack,
  onEditCard,
  onDeleteCard,
  onAddNewCard,
}) => {

    const {onClose} =useStore()

  const paymentMethods: PaymentMethod[] = [
    {
      id: "1",
      cardNumber: "5782 **** **** 7684",
      expiryDate: "12/99",
      cvv: "909",
      nextBillingDate: "22nd Aug 2024",
      cardType: "mastercard",
    },
    {
      id: "2",
      cardNumber: "5782 **** **** 7684",
      expiryDate: "12/99",
      cvv: "909",
      nextBillingDate: "22nd Aug 2024",
      cardType: "mastercard",
    },
  ];

  const MastercardLogo = () => (
    <div className="flex items-center">
      <div className="w-8 h-8 relative">
        {/* Mastercard circles */}
        <div className="absolute left-0 w-6 h-6 bg-red-500 rounded-full"></div>
        <div className="absolute right-0 w-6 h-6 bg-orange-400 rounded-full"></div>
      </div>
      <span className="text-white text-xs font-semibold ml-2">mastercard</span>
    </div>
  );

  return (
    <div className="w-full h-full p-4">
      <button
        onClick={onClose}
        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <h2 className="text-2xl font-medium my-4">Billing Details</h2>

      {/* Payment Methods */}
      <div className="space-y-6 mb-8">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border-l-2 border-accent-foreground p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <MastercardLogo />
                <div className="text-white">
                  <div className="text-xl font-bold tracking-wider mb-2">
                    {method.cardNumber}
                  </div>
                  <div className="flex gap-8 text-lg font-bold">
                    <span>{method.expiryDate}</span>
                    <span>{method.cvv}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onEditCard?.(method.id)}
                  className="w-10 h-10 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDeleteCard?.(method.id)}
                  className="w-10 h-10 bg-slate-700/50 hover:bg-red-600/50 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-600 mb-6"></div>

            {/* Next Billing Date */}
            <p className="text-slate-400 text-base">
              Next billing date is {method.nextBillingDate}
            </p>
          </div>
        ))}
      </div>

      {/* Add New Card Button */}
      <button
        onClick={onAddNewCard}
        className="w-full bg-slate-700/80 hover:bg-slate-600/80 backdrop-blur-sm rounded-sm border border-slate-600/50 hover:border-slate-500/50 p-3 flex items-center justify-center gap-3 text-white text-base font-semibold transition-all"
      >
        <Plus className="w-6 h-6" />
        Add New Card
      </button>
    </div>
  );
};

export default BillingDetails;
