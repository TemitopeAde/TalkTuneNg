'use server'

import { prisma } from "@/lib/prisma"
import { UserRegistrationData } from "@/types"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { registerSchema } from "@/utils/schema"
import { sendOTPEmail } from "@/utils/emails"
import { generateOTP } from "@/utils/utils"

export async function register(formData: UserRegistrationData) {
    try {
        const { name, email, password, phoneNumber, countryCode } = formData

        const validation = registerSchema.safeParse(formData)
        if (!validation.success) {
            return { error: validation.error.issues[0].message }
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        })

        if (existingUser) {
            return { error: "Email already exists" }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const otp = parseInt(generateOTP(), 10)
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
        const countryCodeInt = countryCode ? parseInt(countryCode, 10) : null

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phoneNumber: phoneNumber,
                countryCode: countryCodeInt,
                otp: otp,
                otpExpiresAt: otpExpiresAt,
                isVerified: false,
            }
        })

        try {
            await sendOTPEmail(email, name, otp)
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError)
            await prisma.user.delete({ where: { id: user.id } })

            // Return specific email error message
            const emailErrorMessage = emailError instanceof Error
                ? emailError.message
                : "Failed to send verification email"

            return { error: `Failed to send verification email: ${emailErrorMessage}. Please try again.` }
        }

        return {
            success: true,
            message: "Registration successful! Please check your email for the verification code.",
            userId: user.id
        }

    } catch (error) {
        console.error('Registration error:', error)

        if (error instanceof z.ZodError) {
            return { error: error.issues[0].message }
        }

        // Handle Prisma errors
        if (error && typeof error === 'object' && 'code' in error) {
            const prismaError = error as any

            // Handle specific Prisma error codes
            switch (prismaError.code) {
                case 'P2002':
                    return { error: "Email already exists" }
                case 'P2025':
                    return { error: "Record not found" }
                default:
                    return { error: `Database error: ${prismaError.message || 'Unknown database error'}` }
            }
        }

        // Handle other errors and extract message
        const errorMessage = error instanceof Error
            ? error.message
            : typeof error === 'string'
                ? error
                : "An unexpected error occurred during registration"

        return { error: errorMessage }
    }
}