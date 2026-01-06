'use server'

import { prisma } from "@/lib/prisma"
import { otpSchema } from "@/utils/utils"


export async function confirmOTP(email: string, otp: number) {
    try {
        const validation = otpSchema.safeParse({ email, otp })
        if (!validation.success) {
            return { error: validation.error.issues[0].message }
        }

        const user = await prisma.user.findFirst({
            where: { 
                email: email,
                otp: otp,
                otpExpiresAt: {
                    gte: new Date()
                },
                isVerified: false
            }
        })

        if (!user) {
            return { 
                error: "Invalid or expired verification code. Please check your code or request a new one." 
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                otp: null,
                otpExpiresAt: null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                isVerified: true,
            }
        })

        return { 
            success: true, 
            message: "Email verified successfully! You can now log in to your account.",
            user: updatedUser
        }

    } catch (error) {
        console.error('OTP confirmation error:', error)
        return { 
            error: "An error occurred during verification. Please try again." 
        }
    }
}