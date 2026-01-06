import { NextRequest, NextResponse } from 'next/server'
import { StatusCodes } from 'http-status-codes'
import { authenticateRequest } from '@/lib/auth-middleware'
import { updateProfile } from '@/actions/updatePersonal';

/**
 * @api {get} /api/user/profile Get Current User Profile
 * @apiName GetProfile
 * @apiGroup User
 * @apiDescription Get current authenticated user's profile information
 * 
 * @apiHeader {String} Cookie Authentication cookie with 'auth-token'
 * 
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "user": {
 *         "id": 1,
 *         "name": "John Doe",
 *         "email": "john.doe@example.com",
 *         "phoneNumber": "1234567890",
 *         "countryCode": 1,
 *         "isVerified": true
 *       }
 *     }
 */
export async function GET(request: NextRequest) {
    try {
        // Authenticate the user
        console.log(request);
        
        const user = await authenticateRequest(request)
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required. Please log in.' },
                { status: StatusCodes.UNAUTHORIZED }
            )
        }

        return NextResponse.json(
            {
                success: true,
                user
            },
            { status: StatusCodes.OK }
        )
    } catch (error) {
        console.error('Get Profile API Route Error:', error)
        
        const errorMessage = error instanceof Error 
            ? error.message 
            : 'Internal Server Error'
            
        return NextResponse.json(
            { error: errorMessage },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
    }
}

/**
 * @api {put} /api/user/profile Update User Profile
 * @apiName UpdateProfile
 * @apiGroup User
 * @apiDescription Update user name and phone number. Requires authentication and email verification.
 * 
 * @apiHeader {String} Cookie Authentication cookie with 'auth-token'
 * 
 * @apiBody {String} [name] User's full name (2-50 characters)
 * @apiBody {String} [phoneNumber] Phone number (10-15 digits)
 * @apiBody {String} [countryCode] Country code (1-4 digits)
 * 
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Profile updated successfully",
 *       "user": {
 *         "id": 123,
 *         "name": "John Doe",
 *         "email": "john@example.com",
 *         "phoneNumber": "1234567890",
 *         "countryCode": 1,
 *         "isVerified": true,
 *         "createdAt": "2024-01-01T00:00:00.000Z"
 *       }
 *     }
 * 
 * @apiErrorExample {json} Authentication Required:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "Authentication required. Please log in to update your profile."
 *     }
 * 
 * @apiErrorExample {json} Email Verification Required:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "error": "Email verification required. Please verify your email before updating your profile."
 *     }
 * 
 * @apiErrorExample {json} No Changes:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "No changes to update"
 *     }
 * 
 * @apiErrorExample {json} Validation Error:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Name must be at least 2 characters"
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
 *       "error": "An unexpected error occurred while updating your profile"
 *     }
 */
export async function PUT(request: NextRequest) {
    try {
        // Authenticate the user
        const user = await authenticateRequest(request)
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required. Please log in to update your profile.' },
                { status: StatusCodes.UNAUTHORIZED }
            )
        }

        if (!user.isVerified) {
            return NextResponse.json(
                { error: 'Email verification required. Please verify your email before updating your profile.' },
                { status: StatusCodes.FORBIDDEN }
            )
        }

        const body = await request.json()
        
        // Build profile data with only provided fields
        const profileData: any = {
            userId: user.id,
        }
        
        // Only add fields that are provided in the request
        if (body.name !== undefined && body.name !== null) {
            profileData.name = body.name
        }
        
        if (body.phoneNumber !== undefined && body.phoneNumber !== null) {
            profileData.phoneNumber = body.phoneNumber
        }
        
        if (body.countryCode !== undefined && body.countryCode !== null) {
            profileData.countryCode = body.countryCode
        }
        
        const result = await updateProfile(profileData)

        if (result.error) {
            // Determine appropriate status code based on error type
            let statusCode = StatusCodes.BAD_REQUEST
            
            if (result.error.includes('User not found')) {
                statusCode = StatusCodes.NOT_FOUND
            } else if (result.error.includes('Email verification required')) {
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
                message: result.message,
                user: result.user
            },
            { status: StatusCodes.OK }
        )
    } catch (error) {
        console.error('Update Profile API Route Error:', error)
        
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
            : 'An unexpected error occurred while updating your profile'
            
        return NextResponse.json(
            { error: errorMessage },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
    }
}