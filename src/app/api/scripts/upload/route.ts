import { NextRequest, NextResponse } from 'next/server'
import { uploadScript } from '@/actions/uploadScript'
import { StatusCodes } from 'http-status-codes'
import { UploadScriptDataWithVoice } from '@/types'
import { authenticateRequest } from '@/lib/auth-middleware'
import { getScripts } from '@/actions/getScript'

export type UploadScriptResponse = {
    success?: boolean;
    error?: string;
    message?: string;
    scriptId?: string;
    data?: {
        id: string;
        projectName: string;
        language: string;
        content: string;
        fileName?: string;
        fileSize?: number;
        fileType?: string;
        uploadMode: string;
        createdAt: Date;
        audioFileName?: string;
        audioFileSize?: number;
        audioFileUrl?: string;
    };
}

/**
 * @api {post} /api/scripts/upload Upload Script
 * @apiName UploadScript
 * @apiGroup Scripts
 * @apiDescription Upload a script with optional audio generation. Requires authentication.
 * 
 * @apiHeader {String} Cookie Authentication cookie with 'auth-token'
 * 
 * @apiBody {String} projectName Name of the project/script
 * @apiBody {String} language Script language (e.g., "english", "french", "hausa")
 * @apiBody {String} content Script content text
 * @apiBody {String} mode Upload mode ("manual" or "upload")
 * @apiBody {String} [fileName] File name (required for upload mode)
 * @apiBody {Number} [fileSize] File size in bytes
 * @apiBody {String} [fileType] MIME type of the file
 * @apiBody {Object} [voiceSettings] Voice generation settings
 * @apiBody {String} [voiceSettings.gender] Voice gender ("MALE", "FEMALE", "KID")
 * @apiBody {String} [voiceSettings.age] Voice age group ("CHILD", "TEENAGER", "YOUNG_ADULT", "ELDERLY_45_65", "OLD_70_PLUS")
 * @apiBody {String} [voiceSettings.language] Voice language
 * @apiBody {String} [voiceSettings.mood] Voice mood ("ANGRY", "HAPPY", "ANXIOUS", etc.)
 * @apiBody {Boolean} [generateAudio] Whether to generate audio for the script
 * 
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Script uploaded successfully",
 *       "scriptId": "script_1727616123456_abc123def",
 *       "data": {
 *         "id": "script_1727616123456_abc123def",
 *         "projectName": "My Project",
 *         "language": "english",
 *         "content": "Hello world script content",
 *         "fileName": "script.txt",
 *         "fileSize": 1024,
 *         "fileType": "text/plain",
 *         "uploadMode": "upload",
 *         "createdAt": "2025-09-29T14:33:50.000Z"
 *       }
 *     }
 * 
 * @apiSuccessExample {json} Success Response with Audio:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Script uploaded and audio generated successfully",
 *       "scriptId": "script_1727616123456_abc123def",
 *       "data": {
 *         "id": "script_1727616123456_abc123def",
 *         "projectName": "My Project",
 *         "language": "english",
 *         "content": "Hello world script content",
 *         "fileName": "script.txt",
 *         "fileSize": 1024,
 *         "fileType": "text/plain",
 *         "uploadMode": "upload",
 *         "createdAt": "2025-09-29T14:33:50.000Z",
 *         "audioFileName": "script_1727616123456_abc123def.mp3",
 *         "audioFileSize": 2048,
 *         "audioFileUrl": "https://example.com/audio/script_1727616123456_abc123def.mp3"
 *       }
 *     }
 * 
 * @apiErrorExample {json} Authentication Required:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "Authentication required. Please log in to upload scripts."
 *     }
 * 
 * @apiErrorExample {json} Email Verification Required:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "error": "Email verification required. Please verify your email to upload scripts."
 *     }
 * 
 * @apiErrorExample {json} Validation Error:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Project name is required"
 *     }
 * 
 * @apiErrorExample {json} User Not Found:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "User not found"
 *     }
 * 
 * @apiErrorExample {json} File Required Error:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "File name is required for upload mode"
 *     }
 * 
 * @apiErrorExample {json} Database Error:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "Database error: Connection failed"
 *     }
 * 
 * @apiErrorExample {json} Internal Server Error:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "An unexpected error occurred during script upload"
 *     }
 */
export async function POST(request: NextRequest) {
    try {

        const user = await authenticateRequest(request)

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required. Please log in to upload scripts.' },
                { status: StatusCodes.UNAUTHORIZED }
            )
        }

        if (!user.isVerified) {
            return NextResponse.json(
                { error: 'Email verification required. Please verify your email to upload scripts.' },
                { status: StatusCodes.FORBIDDEN }
            )
        }

        const body = await request.json() as UploadScriptDataWithVoice
        
        // Use the authenticated user's ID instead of relying on the request body
        const scriptData = {
            ...body,
            userId: user.id
        }
        
        const result = await uploadScript(scriptData) as UploadScriptResponse

        if (result.error) {
            // Determine appropriate status code based on error type
            let statusCode = StatusCodes.BAD_REQUEST

            if (result.error.includes('User not found')) {
                statusCode = StatusCodes.NOT_FOUND
            } else if (result.error.includes('Database error') ||
                result.error.includes('An unexpected error occurred')) {
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
                scriptId: result.scriptId,
                data: result.data
            },
            { status: StatusCodes.CREATED }
        )
    } catch (error) {
        console.error('Upload Script API Route Error:', error)

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
