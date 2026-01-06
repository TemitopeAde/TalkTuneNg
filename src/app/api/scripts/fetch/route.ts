import { getScripts } from "@/actions/getScript"
import { authenticateRequest } from "@/lib/auth-middleware"
import { StatusCodes } from "http-status-codes"
import { NextRequest, NextResponse } from "next/server"

/**
 * @api {get} /api/scripts Get User Scripts
 * @apiName GetScripts
 * @apiGroup Scripts
 * @apiDescription Get paginated list of user's scripts with optional search and filtering
 * 
 * @apiHeader {String} Cookie Authentication cookie with 'auth-token'
 * 
 * @apiQuery {Number} [page=1] Page number for pagination
 * @apiQuery {Number} [limit=10] Number of scripts per page (max 50)
 * @apiQuery {String} [search] Search term to filter scripts by project name, content, or filename
 * @apiQuery {String} [language] Filter scripts by language
 * @apiQuery {String} [sortBy=createdAt] Sort field (createdAt or projectName)
 * @apiQuery {String} [sortOrder=desc] Sort order (asc or desc)
 * 
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": {
 *         "scripts": [
 *           {
 *             "id": "script_123",
 *             "projectName": "My Project",
 *             "language": "english",
 *             "content": "Script content...",
 *             "fileName": "script.txt",
 *             "fileSize": 1024,
 *             "fileType": "text/plain",
 *             "uploadMode": "upload",
 *             "audioFileName": "audio_123.mp3",
 *             "audioFileSize": 2048,
 *             "audioFileUrl": "https://...",
 *             "audioGenerated": true,
 *             "audioSettings": "{...}",
 *             "createdAt": "2024-01-01T00:00:00.000Z",
 *             "updatedAt": "2024-01-01T00:00:00.000Z"
 *           }
 *         ],
 *         "pagination": {
 *           "currentPage": 1,
 *           "totalPages": 5,
 *           "totalScripts": 50,
 *           "hasNextPage": true,
 *           "hasPrevPage": false
 *         }
 *       }
 *     }
 * 
 * @apiErrorExample {json} Authentication Required:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "Authentication required. Please log in."
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
 *       "error": "An unexpected error occurred while fetching scripts"
 *     }
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: StatusCodes.UNAUTHORIZED }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50) 
    const search = searchParams.get('search') || ''
    const language = searchParams.get('language') || ''
    const sortBy = (searchParams.get('sortBy') || 'createdAt') as 'createdAt' | 'projectName'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    // Validate pagination parameters
    if (page < 1) {
      return NextResponse.json(
        { error: 'Page number must be greater than 0' },
        { status: StatusCodes.BAD_REQUEST }
      )
    }

    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 50' },
        { status: StatusCodes.BAD_REQUEST }
      )
    }

    // Validate sort parameters
    if (!['createdAt', 'projectName'].includes(sortBy)) {
      return NextResponse.json(
        { error: 'Invalid sortBy parameter. Use "createdAt" or "projectName"' },
        { status: StatusCodes.BAD_REQUEST }
      )
    }

    if (!['asc', 'desc'].includes(sortOrder)) {
      return NextResponse.json(
        { error: 'Invalid sortOrder parameter. Use "asc" or "desc"' },
        { status: StatusCodes.BAD_REQUEST }
      )
    }

    const result = await getScripts({
      userId: user.id,
      page,
      limit,
      search,
      language,
      sortBy,
      sortOrder,
    })

    if (result.error) {
      let statusCode = StatusCodes.BAD_REQUEST

      if (result.error.includes('User not found')) {
        statusCode = StatusCodes.NOT_FOUND
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
        data: result.data
      },
      { status: StatusCodes.OK }
    )
  } catch (error) {
    console.error('Get Scripts API Route Error:', error)

    const errorMessage = error instanceof Error
      ? error.message
      : 'An unexpected error occurred while fetching scripts'

    return NextResponse.json(
      { error: errorMessage },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    )
  }
}