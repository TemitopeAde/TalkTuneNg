'use server'

import { prisma } from "@/lib/prisma"
import { updatePasswordSchema, UpdatePasswordInput } from "@/lib/validations/auth"
import { UpdatePasswordResponse } from "@/types"
import { z } from "zod"
import bcrypt from "bcryptjs"

export async function updatePassword(data: UpdatePasswordInput & { userId: number }): Promise<UpdatePasswordResponse> {
    try {
        const { userId, ...passwordData } = data
        
        // Validate the input data
        const validation = updatePasswordSchema.safeParse(passwordData)
        if (!validation.success) {
            return { error: validation.error.issues[0].message }
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                password: true,
                email: true
            }
        })

        if (!existingUser) {
            return { error: "User not found" }
        }

        // Check if user has a password (social login users might not have one)
        if (!existingUser.password) {
            return { error: "Cannot change password for social login accounts. Please contact support." }
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(passwordData.currentPassword, existingUser.password)
        if (!isCurrentPasswordValid) {
            return { error: "Current password is incorrect" }
        }

        // Check if new password is different from current password
        const isSamePassword = await bcrypt.compare(passwordData.newPassword, existingUser.password)
        if (isSamePassword) {
            return { error: "New password must be different from your current password" }
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(passwordData.newPassword, 12)

        // Update the password
        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedNewPassword
            }
        })

        return {
            success: true,
            message: "Password updated successfully"
        }

    } catch (error) {
        console.error('Update password error:', error)

        if (error instanceof z.ZodError) {
            return { error: error.issues[0].message }
        }

        // Handle Prisma errors
        if (error && typeof error === 'object' && 'code' in error) {
            const prismaError = error as any

            switch (prismaError.code) {
                case 'P2025':
                    return { error: "User not found" }
                default:
                    return { error: `Database error: ${prismaError.message || 'Unknown database error'}` }
            }
        }

        const errorMessage = error instanceof Error
            ? error.message
            : typeof error === 'string'
                ? error
                : "An unexpected error occurred while updating your password"

        return { error: errorMessage }
    }
}