"use client";

import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import PasswordInput from "@/components/inputs/PasswordInput";
import TextInput from "@/components/inputs/TextInput";
import Checkbox from "@/components/ui/checkbox";
import { Apple, Facebook, Google } from "@/constants/Icons";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { useRegister } from "@/hooks/auth/useAuth";
import { ValidationErrors } from "@/types";
import { Loader2 } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import { useCountries } from "@/hooks/useCountries";
import { isValidPhoneNumber } from 'libphonenumber-js';
import { useUserStore } from "@/store/useUserStore"
import CountrySelect from "@/components/CountrySelect";
import { signIn } from "next-auth/react";

const Page = () => {
  const router = useRouter();
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("US");
  const [countryCode, setCountryCode] = useState("+1");
  const [error, setError] = useState("");
  const setEmail = useUserStore((state) => state.setEmail)
  const { mutateAsync: register, isPending } = useRegister();

  const [formData, setFormData] = useState<RegisterInput>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    countryCode: countryCode,
  });

  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { data: countries, isLoading: isLoadingCountries } = useCountries();

  useEffect(() => {
    if (countries?.length) {
      const usa = countries.find(country => country.code === "US");
      if (usa) {
        setCountryCode(usa.dial_code);
        setSelectedCountry("US");
      }
    }
  }, [countries]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      const cleaned = value.replace(/\D/g, '');
      const fullNumber = countryCode + cleaned;

      setFormData(prev => ({
        ...prev,
        [name]: cleaned
      }));

      try {
        const isValid = isValidPhoneNumber(fullNumber);
        if (!isValid) {
          setFieldErrors(prev => ({
            ...prev,
            phoneNumber: ['Please enter a valid phone number']
          }));
        } else {
          setFieldErrors(prev => {
            const { phoneNumber, ...rest } = prev;
            return rest;
          });
        }
      } catch (error) {
        setFieldErrors(prev => ({
          ...prev,
          phoneNumber: ['Invalid phone number format']
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setFormError("");

    if (!agreeToTerms) {
      setFormError("Please accept the terms and conditions to proceed");
      return;
    }

    try {
      // Remove the "+" from country code before validation and submission
      const dataToValidate = {
        ...formData,
        countryCode: countryCode.replace('+', '')
      };

      const validatedData = registerSchema.safeParse(dataToValidate);
      if (!validatedData.success) {
        const errors: ValidationErrors = {};
        validatedData.error.issues.forEach((issue) => {
          const path = issue.path[0] as string;
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(issue.message);
        });

        console.log('Setting field errors:', errors);
        setFieldErrors(errors);
        return;
      }

      const result = await register(validatedData.data);

      setEmail(formData.email);
      router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}`);

    } catch (err: any) {
      console.error('Form submission error:', err);

      const errorMessage = err?.message ||
        err?.error ||
        (typeof err === 'string' ? err : 'An unexpected error occurred');

      setFormError(errorMessage);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full md:max-w-lg flex-col px-4 items-start justify-center overflow-y-auto max-sm:py-10 min-h-screen gap-6"
      noValidate
    >
      <h1 className="text-4xl font-bold">Sign Up</h1>

      {(error || formError) && (
        <div className="w-full p-3 bg-red-500/10 border border-red-500 text-red-500 rounded">
          {error || formError}
        </div>
      )}

      <TextInput
        placeholder="Enter Full Name"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        containerclassname="ring-0 border-0 w-full"
        className="w-full border-0 ring-0"
        required={false}
      />
      {fieldErrors.name && (
        <p className="text-red-500 text-sm mt-1">{fieldErrors.name[0]}</p>
      )}

      <div className="flex gap-3 w-full">
        <CountrySelect
          countries={countries || []}
          valueCode={selectedCountry}
          disabled={isLoadingCountries}
          onSelect={(country) => {
            setSelectedCountry(country.code);
            setCountryCode(country.dial_code);
            setFormData((prev) => ({
              ...prev,
              countryCode: country.dial_code,
            }));
          }}
        />

        <TextInput
          placeholder="Enter phone number"
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          containerclassname="ring-0 border-0 flex-1"
          className="flex-1 border-0 ring-0"
          required={false}
        />
      </div>
      {fieldErrors.phoneNumber && (
        <p className="text-red-500 text-sm mt-1">{fieldErrors.phoneNumber[0]}</p>
      )}

      <TextInput
        placeholder="Enter Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        containerclassname="ring-0 border-0"
        className="flex-1 border-0 ring-0"
        required={false}
      />
      {fieldErrors.email && (
        <p className="text-red-500 text-sm mt-1">{fieldErrors.email[0]}</p>
      )}

      <div className="relative w-full">
        <PasswordInput
          placeholder="Create password"
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
        <button
          type="button"
          onClick={() => setShowPassword(prev => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-100 p-1"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {fieldErrors.password && (
        <p className="text-red-500 text-sm mt-1">{fieldErrors.password[0]}</p>
      )}

      <div className="relative w-full">
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
        <button
          type="button"
          onClick={() => setShowConfirmPassword(prev => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-100 p-1"
        >
          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {fieldErrors.confirmPassword && (
        <p className="text-red-500 text-sm mt-1">{fieldErrors.confirmPassword[0]}</p>
      )}

      <div className="flex items-start gap-3 w-full">
        <Checkbox
          id="agree-terms"
          label=""
          checked={agreeToTerms}
          onChange={setAgreeToTerms}
        />
        <label
          htmlFor="agree-terms"
          className="text-sm text-gray-300 leading-relaxed"
        >
          By clicking on "Signup" you acknowledge that you have read the{" "}
          <Link
            href="/privacy-policy"
            className="text-white underline hover:text-gray-100"
          >
            privacy policy
          </Link>{" "}
          and agree
        </label>
      </div>

      <PrimaryBtn
        label={
          isPending ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating Account...</span>
            </div>
          ) : (
            "Create Account"
          )
        }
        containerclass="w-full cursor-pointer"
        disabled={!agreeToTerms || isPending}
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


      </div>
      <p className="text-sm text-gray-300 font-medium text-right w-full">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-white hover:text-gray-100 font-medium"
        >
          Login
        </Link>
      </p>
    </form>
  );
};

export default Page;
