/**
 * @api {post} /api/resend-otp Resend OTP for email verification
 * @apiName ResendOTP
 * @apiGroup Auth
 * 
 * @apiBody {String} email User's email address
 * 
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "New verification code sent to your email!"
 *     }
 * 
 * @apiErrorExample {json} Error Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Email is required"
 *     }
 * 
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "No account found with this email address"
 *     }
 * 
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Email is already verified"
 *     }
 * 
 *     HTTP/1.1 429 Too Many Requests
 *     {
 *       "error": "Please wait 45 seconds before requesting a new code"
 *     }
 * 
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "Internal server error"
 *     }
 */

import { resendOTP } from "@/actions/resendOtp"
import { StatusCodes } from "http-status-codes"
import { NextRequest, NextResponse } from "next/server"


export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: StatusCodes.BAD_REQUEST }
            )
        }

        const result = await resendOTP(email)

        if (result.error) {
            const isRateLimit = result.error.includes("Please wait")
            return NextResponse.json(
                { error: result.error },
                { status: isRateLimit ? 429 : 400 }
            )
        }

        return NextResponse.json({
            success: true,
            message: result.message
        })

    } catch (error) {
        console.error("Resend OTP route error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}