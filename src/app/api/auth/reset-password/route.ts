import { NextRequest, NextResponse } from 'next/server'
import { resetPassword } from '@/actions/resetPassword'
import { StatusCodes } from 'http-status-codes'

type ResetPasswordResponse = {
  error?: string;
  success?: boolean;
  message?: string;
}

/**
 * @api {post} /api/auth/reset-password Reset user password
 * @apiName ResetPassword
 * @apiGroup Auth
 * 
 * @apiBody {String} code 6-digit verification code
 * @apiBody {String} password New password
 * @apiBody {String} confirmPassword Password confirmation
 * 
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Password reset successful! You can now log in with your new password."
 *     }
 * 
 * @apiErrorExample {json} Error Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Invalid or expired reset code. Please request a new password reset."
 *     }
 * 
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Passwords don't match"
 *     }
 * 
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Password must be at least 8 characters"
 *     }
 * 
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "Internal Server Error"
 *     }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const result = await resetPassword(body) as ResetPasswordResponse

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: StatusCodes.BAD_REQUEST }
            )
        }

        return NextResponse.json(
            { 
                success: result.success,
                message: result.message
            },
            { status: StatusCodes.OK }
        )
    } catch (error) {
        console.error('Reset Password API Route Error:', error)
        
        const errorMessage = error instanceof Error 
            ? error.message 
            : 'Internal Server Error'
            
        return NextResponse.json(
            { error: errorMessage },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
    }
}