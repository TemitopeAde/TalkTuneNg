import { NextRequest, NextResponse } from 'next/server'

import { StatusCodes } from 'http-status-codes'
import { createContactMessage } from '@/actions/contactUs'
import { CreateContactMessageData } from '@/types'

/**
 * @api {post} /api/contact Create Contact Message
 * @apiName CreateContactMessage
 * @apiGroup Contact
 * @apiDescription Submit a contact form message. No authentication required.
 * 
 * @apiBody {String} name User's full name (2-100 characters)
 * @apiBody {String} email User's email address
 * @apiBody {String} message Contact message (10-1000 characters)
 * 
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "success": true,
 *       "message": "Thank you for your message! We'll get back to you soon.",
 *       "data": {
 *         "id": "clx123abc",
 *         "name": "John Doe",
 *         "email": "john@example.com",
 *         "message": "I have a question about...",
 *         "createdAt": "2024-01-01T00:00:00.000Z"
 *       }
 *     }
 * 
 * @apiErrorExample {json} Validation Error:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Name must be at least 2 characters"
 *     }
 * 
 * @apiErrorExample {json} Invalid Email:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Invalid email address"
 *     }
 * 
 * @apiErrorExample {json} Message Too Short:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Message must be at least 10 characters"
 *     }
 * 
 * @apiErrorExample {json} Internal Server Error:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "An unexpected error occurred while sending your message"
 *     }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as CreateContactMessageData

        // Validate required fields
        if (!body.name || !body.email || !body.message) {
            return NextResponse.json(
                { error: 'Name, email, and message are required' },
                { status: StatusCodes.BAD_REQUEST }
            )
        }

        const result = await createContactMessage(body)

        if (result.error) {
            // Determine appropriate status code based on error type
            let statusCode = StatusCodes.BAD_REQUEST
            
            if (result.error.includes('Database error')) {
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
                data: result.data
            },
            { status: StatusCodes.CREATED }
        )
    } catch (error) {
        console.error('Contact Message API Route Error:', error)
        
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
            : 'An unexpected error occurred while sending your message'
            
        return NextResponse.json(
            { error: errorMessage },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
    }
}