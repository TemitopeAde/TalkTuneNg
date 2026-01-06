"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import { useStore } from "@/hooks/useStore";
import ActivePlan from "@/components/ActivePlan";
import BillingDetails from "@/components/BillingDetails";
import Payment from '@/components/flutterwave/Payment';
import { toast } from "sonner";


interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  description: string;
  features: PlanFeature[];
  isPopular?: boolean;
}

const Page = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const { onOpen, onClose } = useStore();

  // const plans: Plan[] = [

  const plans: Plan[] = [
    {
      id: "free",
      name: "Free",
      monthlyPrice: 0,
      description: "Perfect for trying out our voiceover tools.",
      features: [
        {
          text: "Up to 5 voiceovers per month",
          included: true,
        },
        { text: "Access to basic voice styles", included: true },
        { text: "Script limit: 500 characters", included: true },
        {
          text: "Usage reminders: Get nudges when near the free limit (upsell opportunity).",
          included: true,
        },
      ],
    },
    {
      id: "creator",
      name: "Creator Plan",
      monthlyPrice: 8,
      description: "Great for regular content creators.",
      features: [
        {
          text: "Up to 50 voiceovers per month",
          included: true,
        },
        {
          text: "Access to full voice library",
          included: true,
        },
        { text: "Script limit: 2,500 characters", included: true },
        {
          text: "Auto-optimize audio for Instagram/TikTok/YouTube length.",
          included: true,
        },
      ],
    },
    {
      id: "pro",
      name: "Pro Plan",
      monthlyPrice: 13,
      description: "Professional tools for high-quality audio.",
      features: [
        {
          text: "Unlimited voiceovers",
          included: true,
        },
        { text: "Priority processing", included: true },
        { text: "Advanced editing & custom tone/emotion", included: true },
        { text: "Multi-language & accent support", included: true },
        { text: "AI scriptwriting assistant (basic)", included: true },
        {
          text: "Multi-format export: MP3, WAV, and direct export to video editors (Canva, CapCut, etc.).",
          included: true,
        },
        { text: "Script limit: 5,000 characters", included: true },
      ],
    },
    {
      id: "business",
      name: "Business Plan",
      monthlyPrice: 48,
      description: "For teams and businesses.",
      features: [
        {
          text: "Everything in Pro",
          included: true,
        },
        { text: "Team collaboration (multi-user access)", included: true },
        { text: "Background music integration", included: true },
        { text: "API access for integrations", included: true },
        { text: "Advanced analytics & usage reports", included: true },
        { text: "Script limit: 10,000 characters", included: true },
        { text: "Premium customer support", included: true },
        {
          text: "Collaboration features: Commenting, approvals, and version history.",
          included: true,
        },
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise Plan",
      monthlyPrice: 0,
      description: "Custom solutions for large organizations.",
      features: [
        {
          text: "Everything in Business",
          included: true,
        },
        { text: "Dedicated account manager", included: true },
        { text: "Custom voice training & brand-specific accents", included: true },
        { text: "Unlimited characters & usage flexibility", included: true },
        { text: "White-label option", included: true },
      ],
    },
  ];

  const getDisplayPrice = (monthlyPrice: number, cycle: "monthly" | "yearly") => {
    return cycle === "yearly" ? monthlyPrice * 12 : monthlyPrice;
  };

  const handlePlanAction = (plan: Plan) => {
    if (plan.id === 'enterprise') {
      // Handle enterprise plan contact
      console.log('Contacting us for enterprise plan');
      toast.info('Please contact our sales team for Enterprise plan details.');
      return;
    }

    onOpen(
      'payment', // Different type
      <Payment
        planId={plan.id}
        billingCycle={billingCycle}
        onSuccess={async (response) => {
          console.log('Payment successful', response);
          await updateUserSubscription(plan.id);
        }}
        onClose={() => {
          onClose(); // Close the payment modal
        }}
      />
    );
  };

  const updateUserSubscription = async (planId: string) => {
    try {
      const response = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (response.ok) {
        console.log('User subscription updated successfully');
      } else {
        console.error('Failed to update user subscription');
      }
    } catch (error) {
      console.error('An error occurred while updating user subscription', error);
    }
  };

  return (
    <div className="p-4 md:p-6 overflow-y-auto min-h-[90vh] md:min-h-screen">
      <div className="w-full mx-auto">
        <div className="flex justify-between md:items-center items-start flex-col  md:flex-row mb-12">
          <div className="flex items-center md:space-x-4 md:flex-row flex-col">
            <h1 className="text-4xl font-bold text-white mb-4">Subscription</h1>

            <div className="flex bg-slate-700/50  rounded-sm w-auto">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-8 py-2 rounded-sm text-sm font-medium transition-all ${billingCycle === "monthly"
                  ? "bg-white text-gray-900 shadow-lg"
                  : "text-slate-300 hover:text-white"
                  }`}
              >
                Monthly
              </button>
              {/* <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-8 py-2 rounded-sm text-sm font-medium transition-all ${billingCycle === "yearly"
                  ? "bg-white text-gray-900 shadow-lg"
                  : "text-slate-300 hover:text-white"
                  }`}
              >
                Yearly
              </button> */}
            </div>
          </div>

          <div className="flex gap-4 md:flex-row  mt-6">
            <button
              onClick={() => onOpen("modal", <ActivePlan />)}
              className="border border-white whitespace-nowrap rounded-sm py-2 px-4 md:px-6 font-medium cursor-pointer hover:bg-gray-50/10"
            >
              View Active Plan
            </button>
            <PrimaryBtn
              onClick={() => onOpen("modal", <BillingDetails />)}
              label="View Billing details"
            />
          </div>
        </div>

        <div className="flex items-start flex-wrap gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-[#1E2E40] rounded-md max-w-[350px] md:min-w-[380px] md:max-w-[500px] p-8 border-l-2 border-[#8CBE4160]
                hover:border-[#8CBE41] transition-all duration-300`}
            >
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {plan.name}
                </h3>
                {plan.id === "enterprise" ? (
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-white">
                      Custom
                    </span>
                    <span className="text-slate-400 ml-1">
                      Pricing (Contact Us)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-white">
                      ${getDisplayPrice(plan.monthlyPrice, billingCycle)}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-slate-400 ml-1">
                        /{billingCycle === "yearly" ? "year" : "month"}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-slate-300 text-sm leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 text-sm leading-relaxed">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-auto">
                <PrimaryBtn
                  onClick={() => handlePlanAction(plan)}
                  label={plan.id === "enterprise" ? "Contact Us" : "Choose Plan"}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;