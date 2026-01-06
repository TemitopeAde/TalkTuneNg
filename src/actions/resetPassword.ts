'use server'

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const resetPasswordSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d{6}$/, "Code must contain only numbers"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export async function resetPassword(formData: ResetPasswordInput) {
    try {
        const { code, password } = formData

        const validation = resetPasswordSchema.safeParse(formData)
        if (!validation.success) {
            return { error: validation.error.issues[0].message }
        }

        const resetCode = parseInt(code, 10)

        const user = await prisma.user.findFirst({
            where: {
                otp: resetCode,
                otpExpiresAt: {
                    gte: new Date()
                }
            },
            select: {
                id: true,
                email: true,
                name: true,
                isVerified: true
            }
        })

        if (!user) {
            return { 
                error: "Invalid or expired reset code. Please request a new password reset." 
            }
        }

        if (!user.isVerified) {
            return { 
                error: "Account not verified. Please verify your email first." 
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                otp: null,
                otpExpiresAt: null,
            }
        })

        return {
            success: true,
            message: "Password reset successful! You can now log in with your new password."
        }

    } catch (error) {
        console.error('Reset password error:', error)
        
       
        if (error && typeof error === 'object' && 'code' in error) {
            const prismaError = error as any
            return { error: `Database error: ${prismaError.message || 'Unknown database error'}` }
        }
        
        const errorMessage = error instanceof Error 
            ? error.message 
            : typeof error === 'string' 
                ? error 
                : "An unexpected error occurred during password reset"
        
        return { error: errorMessage }
    }
}