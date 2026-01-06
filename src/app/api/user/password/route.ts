import { NextRequest, NextResponse } from 'next/server'
import { updatePassword } from '@/actions/updatePassword'
import { StatusCodes } from 'http-status-codes'
import { UpdatePasswordData, UpdatePasswordResponse } from '@/types'
import { authenticateRequest } from '@/lib/auth-middleware'

/**
 * @api {put} /api/user/password Update User Password
 * @apiName UpdatePassword
 * @apiGroup User
 * @apiDescription Update user password. Requires authentication and current password verification.
 * 
 * @apiHeader {String} Cookie Authentication cookie with 'auth-token'
 * 
 * @apiBody {String} currentPassword Current password for verification
 * @apiBody {String} newPassword New password (min 8 chars, must contain uppercase, lowercase, and number)
 * @apiBody {String} confirmPassword Confirmation of new password
 * 
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Password updated successfully"
 *     }
 * 
 * @apiErrorExample {json} Authentication Required:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "Authentication required. Please log in to update your password."
 *     }
 * 
 * @apiErrorExample {json} Email Verification Required:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "error": "Email verification required. Please verify your email to update your password."
 *     }
 * 
 * @apiErrorExample {json} Social Login Account:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "error": "Cannot change password for social login accounts. Please contact support."
 *     }
 * 
 * @apiErrorExample {json} Invalid Current Password:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Current password is incorrect"
 *     }
 * 
 * @apiErrorExample {json} Same Password:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "New password must be different from your current password"
 *     }
 * 
 * @apiErrorExample {json} Validation Error:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "New password must contain at least one uppercase letter, one lowercase letter, and one number"
 *     }
 * 
 * @apiErrorExample {json} Password Mismatch:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "New passwords don't match"
 *     }
 * 
 * @apiErrorExample {json} User Not Found:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "User not found"
 *     }
 * 
 * @apiErrorExample {json} Internal Server Error:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "An unexpected error occurred while updating your password"
 *     }
 */
export async function PUT(request: NextRequest) {
    try {
        // Authenticate the user first
        const user = await authenticateRequest(request)
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required. Please log in to update your password.' },
                { status: StatusCodes.UNAUTHORIZED }
            )
        }

        if (!user.isVerified) {
            return NextResponse.json(
                { error: 'Email verification required. Please verify your email to update your password.' },
                { status: StatusCodes.FORBIDDEN }
            )
        }

        const body = await request.json() as UpdatePasswordData
        
        // Add the authenticated user's ID to the data
        const passwordData = {
            ...body,
            userId: user.id
        }
        
        const result = await updatePassword(passwordData) as UpdatePasswordResponse

        if (result.error) {
            // Determine appropriate status code based on error type
            let statusCode = StatusCodes.BAD_REQUEST
            
            if (result.error.includes('User not found')) {
                statusCode = StatusCodes.NOT_FOUND
            } else if (result.error.includes('Cannot change password for social login') || 
                       result.error.includes('social login accounts')) {
                statusCode = StatusCodes.FORBIDDEN
            } else if (result.error.includes('Database error')) {
                statusCode = StatusCodes.INTERNAL_SERVER_ERROR
            }

            return NextResponse.json(
                { error: result.error },
                { status: statusCode }
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
        console.error('Update Password API Route Error:', error)
        
        // Handle JSON parsing errors
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: 'Invalid JSON format in request body' },
                { status: StatusCodes.BAD_REQUEST }
            )
        }

        // Extract meaningful error message
        const errorMessage = error instanceof Error 
            ? error.message 
            : 'Internal Server Error'
            
        return NextResponse.json(
            { error: errorMessage },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
    }
}