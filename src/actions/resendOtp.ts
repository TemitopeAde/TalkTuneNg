'use server'

import { prisma } from "@/lib/prisma"
import { sendOTPEmail } from "@/utils/emails"
import { resendOtpSchema } from "@/utils/utils"


export async function resendOTP(email: string) {
    try {
        const validation = resendOtpSchema.safeParse({ email })
        if (!validation.success) {
            return { error: validation.error.issues[0].message }
        }

        const user = await prisma.user.findUnique({
            where: { email: email }
        })

        if (!user) {
            return { error: "No account found with this email address" }
        }

        if (user.isVerified) {
            return { error: "Email is already verified" }
        }

        if (user.otpExpiresAt && user.otpExpiresAt > new Date(Date.now() - 60 * 1000)) {
            const timeLeft = Math.ceil((user.otpExpiresAt.getTime() - (Date.now() - 9 * 60 * 1000)) / 1000)
            return { 
                error: `Please wait ${timeLeft} seconds before requesting a new code` 
            }
        }

        const newOTP = Math.floor(100000 + Math.random() * 900000)
        const newOTPExpiresAt = new Date(Date.now() + 10 * 60 * 1000)

        await prisma.user.update({
            where: { id: user.id },
            data: {
                otp: newOTP,
                otpExpiresAt: newOTPExpiresAt,
            }
        })

        try {
            
            await sendOTPEmail(user.email, user.name || "", newOTP)
        } catch (emailError) {
            console.error('Failed to resend OTP email:', emailError)
            return { error: "Failed to send verification code. Please try again." }
        }

        return { 
            success: true, 
            message: "New verification code sent to your email!" 
        }

    } catch (error) {
        console.error('Resend OTP error:', error)
        return { 
            error: "An error occurred while sending the verification code" 
        }
    }
}