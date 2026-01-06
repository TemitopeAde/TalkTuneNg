import z from "zod";


export const updateProfileSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .optional(),
  phoneNumber: z.string()
    .regex(/^\d{10,15}$/, "Phone number must be 10-15 digits")
    .optional(),
  countryCode: z.string()
    .regex(/^\d{1,4}$/, "Country code must be 1-4 digits")
    .optional(),
}).strict()

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})


export const uploadScriptSchema = z.object({
  projectName: z.string().min(1, "Project name is required").trim(),
  language: z.string().min(1, "Language is required").trim(),
  content: z.string().min(1, "Script content is required"),
  mode: z.enum(['manual', 'upload'], { message: "Upload mode is required" }),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  fileType: z.string().optional(),
  userId: z.number().positive("Valid user ID is required"),
})


// Validation schema for contact message
export const contactMessageSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  message: z.string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),
})