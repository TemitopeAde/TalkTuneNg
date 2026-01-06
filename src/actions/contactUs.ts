'use server'

import { prisma } from "@/lib/prisma"
import { CreateContactMessageData, CreateContactMessageResponse } from "@/types"
import { contactMessageSchema } from "@/utils/schema"
import { sendContactConfirmationEmail, sendContactNotificationToAdmin } from "@/utils/emails"
import { z } from "zod"

export async function createContactMessage(
    formData: CreateContactMessageData
): Promise<CreateContactMessageResponse> {
    try {
        const { name, email, message } = formData

        const validation = contactMessageSchema.safeParse(formData)
        if (!validation.success) {
            return { error: validation.error.issues[0].message }
        }

        const contactMessage = await prisma.contactMessage.create({
            data: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                message: message.trim(),
            }
        })

        try {
            await sendContactConfirmationEmail(email, name, message)
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError)
        }

        try {
            await sendContactNotificationToAdmin(name, email, message)
        } catch (emailError) {
            console.error('Failed to send admin notification:', emailError)
        }

        return {
            success: true,
            message: "Thank you for your message! We'll get back to you soon.",
            data: {
                id: contactMessage.id,
                name: contactMessage.name,
                email: contactMessage.email,
                message: contactMessage.message,
                createdAt: contactMessage.createdAt,
            }
        }

    } catch (error) {
        console.error('Create contact message error:', error)

        if (error instanceof z.ZodError) {
            return { error: error.issues[0].message }
        }

        if (error && typeof error === 'object' && 'code' in error) {
            const prismaError = error as any

            switch (prismaError.code) {
                case 'P2002':
                    return { error: "A message with this information already exists" }
                case 'P2025':
                    return { error: "Record not found" }
                default:
                    return { error: `Database error: ${prismaError.message || 'Unknown database error'}` }
            }
        }

        const errorMessage = error instanceof Error
            ? error.message
            : "An unexpected error occurred while sending your message"

        return { error: errorMessage }
    }
}