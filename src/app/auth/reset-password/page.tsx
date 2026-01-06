"use client";

import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import PasswordInput from "@/components/inputs/PasswordInput";
import TextInput from "@/components/inputs/TextInput";
import Link from "next/link";
import React, { useState } from "react";
import { ValidationErrors } from "@/types";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useResetPassword } from "@/hooks/auth/useAuth";


const passwordResetSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d{6}$/, "Code must contain only numbers"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordResetInput = z.infer<typeof passwordResetSchema>;

const Page = () => {
  const router = useRouter();
  const resetPasswordMutation = useResetPassword();

  const [formData, setFormData] = useState<PasswordResetInput>({
    code: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'code' ? value.replace(/\D/g, '').slice(0, 6) : value
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

    try {
      const validatedData = passwordResetSchema.safeParse(formData);
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

      resetPasswordMutation.mutate(
        {
          code: validatedData.data.code,
          password: validatedData.data.password,
          confirmPassword: validatedData.data.confirmPassword,
        },
        {
          onSuccess: () => {
            toast("Password has been reset successfully!");
            setFormData({ code: "", password: "", confirmPassword: "" });
            setTimeout(() => {
              router.push("/auth/reset-password-success");
            }, 500);
          },
          onError: (error) => {

            toast.error(error.message || "Failed to reset password");

            setTimeout(() => {
              router.push("/auth/reset-password-failed");
            }, 500);
          },
        }
      );

    } catch (err: any) {
      console.error('Password reset error:', err);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-lg w-full flex-col px-4 items-start justify-center h-screen gap-6"
      noValidate
    >
      <h1 className="text-4xl font-bold">Password Reset</h1>

      <span className="text-sm text-gray-300 leading-relaxed">
        Enter the 6-digit code sent to your email and create a new password.
      </span>

      <TextInput
        placeholder="Enter 6-digit code"
        type="text"
        name="code"
        value={formData.code}
        onChange={handleInputChange}
        containerclassname="ring-0 border-0 w-full"
        className="w-full border-0 ring-0 text-center text-2xl tracking-widest"
        maxLength={6}
        required={false}
      />
      {fieldErrors.code && (
        <p className="text-red-500 text-sm mt-1">{fieldErrors.code[0]}</p>
      )}

      <PasswordInput
        placeholder="Enter new password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        containerclassname="ring-0 border-0 w-full"
        className="w-full border-0 ring-0"
        required={false}
        showPassword={showPassword}
        onTogglePassword={() => setShowPassword(prev => !prev)}
      />

      {fieldErrors.password && (
        <p className="text-red-500 text-sm mt-1">{fieldErrors.password[0]}</p>
      )}

      <PasswordInput
        placeholder="Confirm password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        containerclassname="ring-0 border-0 w-full"
        className="w-full border-0 ring-0"
        required={false}
        showPassword={showConfirmPassword}
        onTogglePassword={() => setShowConfirmPassword(prev => !prev)}
      />
      {fieldErrors.confirmPassword && (
        <p className="text-red-500 text-sm mt-1">{fieldErrors.confirmPassword[0]}</p>
      )}

      <PrimaryBtn
        label={
          resetPasswordMutation.isPending ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Resetting Password...</span>
            </div>
          ) : (
            "Complete Reset"
          )
        }
        containerclass="w-full cursor-pointer"
        disabled={resetPasswordMutation.isPending}
        type="submit"
      />

      <div className="flex items-center justify-center w-full text-sm">
        <Link
          href="/auth/login"
          className="text-gray-300 hover:text-white font-medium"
        >
          Back to Login
        </Link>
      </div>
    </form>
  );
};

export default Page;