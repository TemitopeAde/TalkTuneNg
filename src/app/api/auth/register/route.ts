import { NextRequest, NextResponse } from 'next/server'
import { register } from '@/actions/register'
import { StatusCodes } from 'http-status-codes'

type RegisterResponse = {
  error?: string;
  success?: boolean;
  message?: string;
  userId?: string;
}

/**
 * @api {post} /api/register Register a new user
 * @apiName RegisterUser
 * @apiGroup Auth
 * 
 * @apiBody {String} name User's full name
 * @apiBody {String} email User's email address
 * @apiBody {String} password User's password
 * @apiBody {String} phoneNumber User's phone number
 * @apiBody {String} countryCode Country calling code
 * 
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "success": true,
 *       "message": "Registration successful! Please check your email for the verification code.",
 *       "userId": "clm123abc..."
 *     }
 * 
 * @apiErrorExample {json} Error Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Email already exists"
 *     }
 * 
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Failed to send verification email: SMTP connection failed. Please try again."
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
        const result = await register(body) as RegisterResponse

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: StatusCodes.BAD_REQUEST }
            )
        }

        return NextResponse.json(
            { 
                success: result.success,
                message: result.message,
                userId: result.userId
            },
            { status: StatusCodes.CREATED }
        )
    } catch (error) {
        console.error('API Route Error:', error)
        
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