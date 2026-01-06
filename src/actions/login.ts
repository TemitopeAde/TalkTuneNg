'use server'

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { cookies } from 'next/headers'
import { generateToken, generateRefreshToken } from '@/lib/jwt'
import { sendOTPEmail } from '@/utils/emails'
import { generateOTP } from '@/utils/utils'
import { loginSchema } from "@/utils/schema"


export type LoginInput = z.infer<typeof loginSchema>

export async function login(formData: LoginInput) {
    try {
        const { email, password } = formData

        const validation = loginSchema.safeParse(formData)
        if (!validation.success) {
            return { error: validation.error.issues[0].message }
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                isVerified: true,
                createdAt: true
            }
        })

        if (!user) {
            return { error: "Invalid email or password" }
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return { error: "Invalid email or password", status: 403 }
        }

        if (!user.isVerified) {
            try {

                const otp = parseInt(generateOTP(), 10)
                const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)

                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        otp: otp,
                        otpExpiresAt: otpExpiresAt,
                    }
                })

                await sendOTPEmail(user.email, user.name || 'User', otp)

                return {
                    error: "Your email is not verified. We've sent a new verification code to your email address.",
                    requiresVerification: true,
                    email: user.email
                }

            } catch (emailError) {
                console.error('Failed to send OTP email:', emailError)
                return {
                    error: "Your email is not verified and we couldn't send a verification code. Please try again later.",
                    requiresVerification: true,
                    email: user.email
                }
            }
        }


        const token = generateToken({
            userId: user.id,
            email: user.email
        })

        const refreshToken = generateRefreshToken({
            userId: user.id
        })

        const cookieStore = await cookies()

        cookieStore.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
        })

        cookieStore.set('refresh-token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
            path: '/'
        })

        const { password: _, ...userWithoutPassword } = user

        return {
            success: true,
            message: "Login successful!",
            user: userWithoutPassword,
            token
        }

    } catch (error) {
        console.error('Login error:', error)

        if (error && typeof error === 'object' && 'code' in error) {
            const prismaError = error as any
            return { error: `Database error: ${prismaError.message || 'Unknown database error'}` }
        }

        const errorMessage = error instanceof Error
            ? error.message
            : typeof error === 'string'
                ? error
                : "An unexpected error occurred during login"

        return { error: errorMessage }
    }
}