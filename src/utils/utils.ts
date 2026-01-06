import z from "zod"

export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}


export const resendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export const otpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.number().min(100000).max(999999)
})