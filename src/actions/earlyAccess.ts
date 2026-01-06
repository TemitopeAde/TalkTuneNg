'use server'

import { prisma } from "@/lib/prisma"
import { z } from "zod"

const earlyAccessSchema = z.object({
    email: z.string()
        .email("Invalid email address")
        .max(255, "Email must be less than 255 characters"),
})

export interface CreateEarlyAccessData {
    email: string
}

export interface CreateEarlyAccessResponse {
    success?: boolean
    message?: string
    error?: string
}

export async function createEarlyAccess(
    formData: CreateEarlyAccessData
): Promise<CreateEarlyAccessResponse> {
    try {
        const { email } = formData

        const validation = earlyAccessSchema.safeParse(formData)
        if (!validation.success) {
            return { error: validation.error.issues[0].message }
        }

        const existingEmail = await prisma.earlyAccess.findUnique({
            where: { email: email.trim().toLowerCase() }
        })

        if (existingEmail) {
            return { error: "This email is already registered for early access" }
        }

        await prisma.earlyAccess.create({
            data: {
                email: email.trim().toLowerCase(),
            }
        })

        return {
            success: true,
            message: "Thank you! You've been added to our early access list."
        }

    } catch (error) {
        console.error('Create early access error:', error)

        if (error instanceof z.ZodError) {
            return { error: error.issues[0].message }
        }

        if (error && typeof error === 'object' && 'code' in error) {
            const prismaError = error as any

            switch (prismaError.code) {
                case 'P2002':
                    return { error: "This email is already registered for early access" }
                case 'P2025':
                    return { error: "Record not found" }
                default:
                    return { error: `Database error: ${prismaError.message || 'Unknown database error'}` }
            }
        }

        const errorMessage = error instanceof Error
            ? error.message
            : "An unexpected error occurred while registering for early access"

        return { error: errorMessage }
    }
}