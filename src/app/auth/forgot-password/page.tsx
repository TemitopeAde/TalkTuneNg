"use client";

import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import TextInput from "@/components/inputs/TextInput";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForgotPassword } from "@/hooks/auth/useAuth";
import { ValidationErrors } from "@/types";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { forgotPasswordSchema } from "@/utils/schema";
import { toast } from "sonner";

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

const Page = () => {
  const router = useRouter();
  const { mutateAsync: forgotPassword, isPending } = useForgotPassword();

  const [formData, setFormData] = useState<ForgotPasswordInput>({
    email: "",
  });

  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setFormError("");
    setSuccess("");

    try {
      const validatedData = forgotPasswordSchema.safeParse(formData);
      if (!validatedData.success) {
        const errors: ValidationErrors = {};
        validatedData.error.issues.forEach((issue) => {
          const path = issue.path[0] as string;
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(issue.message);
        });
        setFieldErrors(errors);
        return;
      }

      const result = await forgotPassword(validatedData.data);

      toast(`${result.message || "Reset instructions sent successfully!"}`);

      // Optional: Redirect to login after success
      setTimeout(() => {
        router.push("/auth/reset-password");
      }, 3000);

    } catch (err: any) {
      console.error('Forgot password error:', err);
      const errorMessage = err?.message || 'An unexpected error occurred';
      setFormError(errorMessage);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="flex max-w-lg w-full flex-col px-4 items-start justify-center h-screen gap-6"
      noValidate
    >
      <h1 className="text-4xl font-bold">Forgot Password</h1>
      
      <span className="text-sm text-gray-300 leading-relaxed">
        Enter your email address and we'll send you instructions to reset your password.
      </span>

      {(formError || success) && (
        <div className={`w-full p-3 rounded ${
          formError 
            ? "bg-red-500/10 border border-red-500 text-red-500" 
            : "bg-green-500/10 border border-green-500 text-green-500"
        }`}>
          {formError || success}
        </div>
      )}

      <TextInput
        placeholder="Enter your email address"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        containerclassname="ring-0 border-0 w-full"
        className="w-full border-0 ring-0"
        required={false}
      />
      {fieldErrors.email && (
        <p className="text-red-500 text-sm mt-1">{fieldErrors.email[0]}</p>
      )}

      <PrimaryBtn
        label={
          isPending ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sending...</span>
            </div>
          ) : (
            "Send Reset Instructions"
          )
        }
        containerclass="w-full cursor-pointer"
        disabled={isPending}
        type="submit"
      />

      <div className="flex items-center justify-between w-full text-sm">
        <Link
          href="/auth/login"
          className="text-gray-300 hover:text-white font-medium"
        >
          Back to Login
        </Link>
        
        <span className="text-gray-300">
          Don't have an account?{" "}
          <Link
            href="/auth/register"
            className="text-white hover:text-gray-100 font-medium"
          >
            Register
          </Link>
        </span>
      </div>
    </form>
  );
};

export default Page;