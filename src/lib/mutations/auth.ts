"use client";

import { RegisterInput } from "../validations/auth";

export const registerUser = async (data: RegisterInput) => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.error || "Registration failed");
  }

  return responseData;
};


export const confirmOTP = async (email: string, otp: string) => {
  const response = await fetch("/api/auth/confirm-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, otp }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.error || "OTP confirmation failed");
  }

  return responseData;
};

export const resendOTP = async (email: string) => {
  const response = await fetch("/api/auth/resend-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.error || "Failed to resend OTP");
  }

  return responseData;
};