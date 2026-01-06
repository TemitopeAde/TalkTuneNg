import { NextRequest, NextResponse } from 'next/server'
import { StatusCodes } from 'http-status-codes'
import { createEarlyAccess, CreateEarlyAccessData } from '@/actions/earlyAccess'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as CreateEarlyAccessData

        if (!body.email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: StatusCodes.BAD_REQUEST }
            )
        }

        const result = await createEarlyAccess(body)

        if (result.error) {
            let statusCode = StatusCodes.BAD_REQUEST

            if (result.error.includes('already registered')) {
                statusCode = StatusCodes.CONFLICT
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
            { status: StatusCodes.CREATED }
        )
    } catch (error) {
        console.error('Early Access API Route Error:', error)

        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: 'Invalid JSON format in request body' },
                { status: StatusCodes.BAD_REQUEST }
            )
        }

        const errorMessage = error instanceof Error
            ? error.message
            : 'An unexpected error occurred while registering for early access'

        return NextResponse.json(
            { error: errorMessage },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
    }
}