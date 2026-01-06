"use client";

import React, { useState } from "react";
import { CreditCard, Lock, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface PaymentProps {
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  onSuccess: (response: any) => void;
  onClose: () => void;
}

const Payment: React.FC<PaymentProps> = ({ planId, billingCycle, onSuccess, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/flutterwave/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId, billingCycle }),
      });

      const data = await response.json();

      console.log('Payment API response:', data);

      if (!response.ok) {
        console.error('Payment API error:', data);
        setError(data.error || data.details || "Failed to initiate payment. Please try again.");
        setIsLoading(false);
        return;
      }

      if (data.status === "success") {
        window.location.href = data.data.link;
      } else {
        console.error('Unexpected response format:', data);
        setError(data.error || data.message || "Failed to initiate payment. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Payment request error:', error);
      setError("An error occurred. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#8CBE41]/20 to-[#00246B]/20 p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-white">Complete Payment</h2>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <p className="text-white/70 text-sm">Secure checkout powered by Flutterwave</p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Plan Details */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/70 text-sm">Plan ID</span>
                <span className="text-white font-semibold">{planId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Billing Cycle</span>
                <span className="text-white font-semibold capitalize">{billingCycle}</span>
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
              <Lock className="w-4 h-4" />
              <span>Your payment is secure and encrypted</span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#8CBE41] to-[#7ab032] hover:from-[#7ab032] hover:to-[#6a9e2a] disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 rounded-xl py-4 px-6 text-white text-lg font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-6 h-6" />
                  Pay with Flutterwave
                </>
              )}
            </button>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#8CBE41]" />
                <span className="text-white/60 text-xs">SSL Secured</span>
              </div>
              <div className="w-px h-4 bg-white/20"></div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#8CBE41]" />
                <span className="text-white/60 text-xs">PCI Compliant</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white/5 border-t border-white/10 px-6 py-4">
            <p className="text-white/50 text-xs text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Powered by Badge */}
        <div className="mt-6 text-center">
          <p className="text-white/40 text-xs">
            Powered by <span className="text-white/60 font-semibold">Flutterwave</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment;