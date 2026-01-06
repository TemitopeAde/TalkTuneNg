"use client";

import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import PasswordInput from "@/components/inputs/PasswordInput";
import TextInput from "@/components/inputs/TextInput";
import Checkbox from "@/components/ui/checkbox";
import { Apple, Facebook, Google } from "@/constants/Icons";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useLogin } from "@/hooks/auth/useAuth";
import { useUserStore } from "@/store/useUserStore";
import { ValidationErrors } from "@/types";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { signIn } from "next-auth/react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginInput = z.infer<typeof loginSchema>;

const Page = () => {
  const router = useRouter();
  const [remember, setRemember] = useState(false);
  const { setUser, setToken, setEmail } = useUserStore();
  const { mutateAsync: login, isPending } = useLogin();

  const [formData, setFormData] = useState<LoginInput>({
    email: "",
    password: "",
  });


  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setFieldErrors({});
  //   setFormError("");

  //   try {
  //     const validatedData = loginSchema.safeParse(formData);
  //     if (!validatedData.success) {
  //       const errors: ValidationErrors = {};
  //       validatedData.error.issues.forEach((issue) => {
  //         const path = issue.path[0] as string;
  //         if (!errors[path]) {
  //           errors[path] = [];
  //         }
  //         errors[path].push(issue.message);
  //       });
  //       setFieldErrors(errors);
  //       return;
  //     }

  //     const result = await login(validatedData.data);

  //     if (result.result.error === "Invalid email or password") {
  //       setFormError("Invalid email or password");
  //     }


  //     // Check if user needs email verification
  //     if (result.result.requiresVerification) {
  //       setFormError("Please verify your email address");
  //       setEmail(result.email || formData.email);
  //       router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}`);
  //       return;
  //     }

  //     // Normal successful login
  //     if (result.success && result.user) {
  //       setUser(result.user);
  //       if (result.token) {
  //         setToken(result.token);
  //       }
  //       router.push("/dashboard");
  //     }

  //   } catch (err: any) {
  //     console.error('Login error:', err);
  //     const errorMessage = err?.message || 'An unexpected error occurred';
  //     setFormError(errorMessage);
  //   }
  // };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setFormError("");

    try {
      const validatedData = loginSchema.safeParse(formData);
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

      const result = await login(validatedData.data);

      // Check if there's an error in the result
      if (result.result?.error) {
        setFormError(result.result.error);

        // Check if user needs email verification
        if (result.result.requiresVerification) {
          setEmail(result.result.email || formData.email);
          router.push(`/auth/verify?email=${encodeURIComponent(result.result.email || formData.email)}`);
        }
        return;
      }

      // Normal successful login
      if (result.success && result.user) {
        setUser(result.user);
        if (result.token) {
          setToken(result.token);
        }
        router.push("/dashboard");
      }

    } catch (err: any) {
      console.error('Login error:', err);
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
      <h1 className="text-4xl font-bold">Login</h1>

      {formError && (
        <div className="w-full p-3 bg-red-500/10 border border-red-500 text-red-500 rounded">
          {formError}
        </div>
      )}

      <TextInput
        placeholder="Enter your email"
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


      <PasswordInput
        placeholder="Enter password"
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

      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember-me"
            label="Remember me"
            checked={remember}
            onChange={setRemember}
          />
        </div>

        <Link
          href="/auth/forgot-password"
          className="text-sm text-white hover:text-gray-100 font-medium"
        >
          Forgot password?
        </Link>
      </div>

      <PrimaryBtn
        label={
          isPending ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Logging in...</span>
            </div>
          ) : (
            "Login"
          )
        }
        containerclass="w-full cursor-pointer"
        disabled={isPending}
        type="submit"
      />

      <p className="text-center w-full">or</p>

      <div className="grid grid-cols-1 gap-4 w-full">
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="flex items-center h-[50px] font-semibold justify-center bg-[#DB4437] text-gray-100 hover:bg-[#DB443780] py-2 rounded-sm transition-colors duration-200"
        >
          <Image
            src={Google}
            alt="Google"
            width={20}
            height={20}
            className="mr-2"
          />
          <span>Google</span>
        </button>
        {/* <button
          type="button"
          onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })}
          className="flex items-center h-[50px] font-semibold justify-center bg-[#005EBA] text-gray-100 hover:bg-[#005EBA80] py-2 rounded-sm transition-colors duration-200"
        >
          <Image
            src={Facebook}
            alt="Facebook"
            width={10}
            height={10}
            className="mr-2"
          />
          <span>Facebook</span>
        </button> */}
        {/* <Link
          href="#"
          className="flex items-center h-[50px] font-semibold justify-center bg-[#25324B] text-gray-100 hover:bg-gray-800 py-2 rounded-sm transition-colors duration-200"
        >
          <Image
            src={Apple}
            alt="Apple"
            width={20}
            height={20}
            className="mr-2"
          />
          <span>Apple</span>
        </Link> */}
      </div>

      <p className="text-sm text-gray-300 font-medium text-right w-full">
        Don't have an account?{" "}
        <Link
          href="/auth/register"
          className="text-white hover:text-gray-100 font-medium"
        >
          Register
        </Link>
      </p>
    </form>
  );
};

export default Page;