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
import { AnimatePresence } from "framer-motion";


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
                            router.push("/auth/login");
                        }, 2000);
                    },
                    onError: (error) => {
                        toast.error(error.message || "Failed to reset password");
                    },
                }
            );

        } catch (err: any) {
            console.error('Password reset error:', err);
            toast.error("An unexpected error occurred");
        }
    };

    return (
        <AnimatePresence>
            <div className="flex gap-4 lg:gap-8 flex-col">
                <div className="flex items-center justify-center">
                    <img src="/icons/check.svg" alt="check" />
                </div>
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold text-center">Password Reset</h1>
                    <p className="text-sm text-gray-300 leading-relaxed text-center">Password reset successful, proceed to login</p>
                </div>

                <Link href="/auth/login" className="w-full text-center bg-white transition-all duration-300 z-0 whitespace-nowrap hover:bg-white/90 rounded-[8px] py-3 px-5 text-[#00246B] font-bold text-[16px]">
                    Proceed to Login
                </Link>
                

            </div>
        </AnimatePresence>

    );
};

export default Page;