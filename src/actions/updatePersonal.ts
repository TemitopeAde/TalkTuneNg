'use server'

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { UpdateProfileData, UpdateProfileResponse } from "@/types"
import { updateProfileSchema } from "@/utils/schema"


export async function updateProfile(formData: UpdateProfileData): Promise<UpdateProfileResponse> {
    try {
        const { userId, name, phoneNumber, countryCode } = formData

        // Validate input data
        const validation = updateProfileSchema.safeParse({ name, phoneNumber, countryCode })
        if (!validation.success) {
            return { error: validation.error.issues[0].message }
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!existingUser) {
            return { error: "User not found" }
        }

        // Check if user is verified
        if (!existingUser.isVerified) {
            return { error: "Email verification required. Please verify your email before updating your profile." }
        }

        // Prepare update data
        const updateData: any = {}
        
        if (name !== undefined && name.trim() !== "") {
            updateData.name = name.trim()
        }
        
        if (phoneNumber !== undefined && phoneNumber.trim() !== "") {
            updateData.phoneNumber = phoneNumber.trim()
        }
        
        if (countryCode !== undefined && countryCode.trim() !== "") {
            updateData.countryCode = parseInt(countryCode, 10)
        }

        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
            return { error: "No changes to update" }
        }

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                countryCode: true,
                isVerified: true,
                createdAt: true,
            }
        })

        return {
            success: true,
            message: "Profile updated successfully",
        }

    } catch (error) {
        console.error('Update profile error:', error)

        if (error instanceof z.ZodError) {
            return { error: error.issues[0].message }
        }

        // Handle Prisma errors
        if (error && typeof error === 'object' && 'code' in error) {
            const prismaError = error as any

            switch (prismaError.code) {
                case 'P2025':
                    return { error: "User not found" }
                case 'P2002':
                    return { error: "A user with this information already exists" }
                default:
                    return { error: `Database error: ${prismaError.message || 'Unknown database error'}` }
            }
        }

        const errorMessage = error instanceof Error
            ? error.message
            : "An unexpected error occurred while updating your profile"

        return { error: errorMessage }
    }
}