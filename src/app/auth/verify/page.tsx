"use client";

import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import TextInput from "@/components/inputs/TextInput";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, Suspense } from "react";
import { confirmOTP, resendOTP } from "@/lib/mutations/auth";
import { Loader2 } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";

const VerifyEmailContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { email: storedEmail, setUser, clearEmail } = useUserStore();
  const email = searchParams.get("email") || storedEmail || "";
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    if (!email) {
      setError("Email is missing. Please try registering again.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await confirmOTP(email, otp);
      setSuccess(result.message);

      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");
    setIsResending(true);

    try {
      const result = await resendOTP(email);
      setSuccess(result.message);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex max-w-lg w-full flex-col px-4 items-start justify-center h-screen gap-6">
      <h1 className="text-4xl font-bold">Verify Email</h1>

      <p className="text-sm text-gray-300 leading-relaxed">
        We sent a 6-digit verification code to{" "}
        <span className="text-white font-medium">{email}</span>.
        Enter the code below to verify your email address.
      </p>

      {(error || success) && (
        <div className={`w-full p-3 rounded ${error
          ? "bg-red-500/10 border border-red-500 text-red-500"
          : "bg-green-500/10 border border-green-500 text-green-500"
          }`}>
          {error || success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <TextInput
          placeholder="Enter 6-digit code"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          containerclassname="ring-0 border-0 w-full"
          className="w-full border-0 ring-0 text-center text-2xl tracking-widest"
          maxLength={6}
        />

        <PrimaryBtn
          label={
            isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              "Verify Email"
            )
          }
          containerclass="w-full"
          disabled={isLoading || otp.length !== 6}
          type="submit"
        />
      </form>

      <div className="w-full text-center">
        <p className="text-sm text-gray-300">
          Didn't receive the code?{" "}
          <button
            onClick={handleResendOTP}
            disabled={isResending}
            className="text-white hover:text-gray-100 underline disabled:opacity-50 inline-flex items-center gap-1"
          >
            {isResending && <Loader2 className="h-3 w-3 animate-spin" />}
            {isResending ? "Sending..." : "Resend Code"}
          </button>
        </p>
      </div>

      <div className="w-full text-center">
        <Link
          href="/auth/register"
          className="text-sm text-gray-300 hover:text-white underline"
        >
          Back to Registration
        </Link>
      </div>
    </div>
  );
};

const VerifyEmailFallback = () => (
  <div className="flex max-w-lg w-full flex-col px-4 items-start justify-center h-screen gap-6">
    <div className="w-full flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  </div>
);

const Page = () => {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
};

export default Page;