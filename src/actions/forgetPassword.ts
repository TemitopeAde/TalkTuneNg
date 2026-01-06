'use server'

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { generateOTP } from '@/utils/utils'
import { forgotPasswordSchema } from "@/utils/schema"
import { sendOTPEmail, sendPasswordResetEmail } from "@/utils/emails"


export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export async function forgotPassword(formData: ForgotPasswordInput) {
    try {
        const { email } = formData

        const validation = forgotPasswordSchema.safeParse(formData)
        if (!validation.success) {
            return { error: validation.error.issues[0].message }
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                isVerified: true
            }
        })

        if (!user) {
            return {
                success: true,
                message: "If an account with that email exists, we've sent password reset instructions to your email address."
            }
        }

        if (!user.isVerified) {
            
            const verificationOTP = parseInt(generateOTP(), 10)
            const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)

            await prisma.user.update({
                where: { id: user.id },
                data: { otp: verificationOTP, otpExpiresAt }
            })
            await sendOTPEmail(user.email, user.name || 'User', verificationOTP)

            return {
                success: true,
                message: "Please verify your email first. We've sent a verification code to your email address."
            }
        }

        const resetToken = parseInt(generateOTP(), 10)
        const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000) 

        await prisma.user.update({
            where: { id: user.id },
            data: {
                otp: resetToken, 
                otpExpiresAt: resetTokenExpiry,
            }
        })

        try {
            await sendPasswordResetEmail(user.email, user.name || 'User', resetToken)
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError)

            // Clear the reset token if email fails
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    otp: null,
                    otpExpiresAt: null,
                }
            })

            return {
                error: "Failed to send password reset email. Please try again later."
            }
        }

        return {
            success: true,
            message: "If an account with that email exists, we've sent password reset instructions to your email address."
        }

    } catch (error) {
        console.error('Forgot password error:', error)

        if (error && typeof error === 'object' && 'code' in error) {
            const prismaError = error as any
            return { error: `Database error: ${prismaError.message || 'Unknown database error'}` }
        }

        const errorMessage = error instanceof Error
            ? error.message
            : typeof error === 'string'
                ? error
                : "An unexpected error occurred"

        return { error: errorMessage }
    }
}