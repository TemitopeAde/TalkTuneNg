import { NextRequest, NextResponse } from 'next/server'
import { StatusCodes } from 'http-status-codes'
import { uploadScript } from '@/actions/uploadScript'
// import { getServerSession } from 'next-auth' // If using NextAuth
// import { authOptions } from '@/lib/auth' // Your auth config

export type UploadScriptResponse = {
  error?: string;
  success?: boolean;
  message?: string;
  scriptId?: string;
  data?: {
    projectName: string;
    language: string;
    content: string;
    fileName?: string;
    fileSize?: number;
  };
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes
const ALLOWED_FILE_TYPES = ['.txt', '.docx'];

/**
 * @api {post} /api/scripts/upload Upload script content
 * @apiName UploadScript
 * @apiGroup Scripts
 * 
 * @apiDescription Upload script content either as manual text input or file upload (TXT, DOCX)
 * 
 * @apiBody {String} projectName Project name for the script
 * @apiBody {String} language Target language for the script
 * @apiBody {String} [content] Manual script content (for manual input)
 * @apiBody {File} [file] Script file (for file upload - TXT or DOCX, max 100MB)
 * @apiBody {String} mode Upload mode: "manual" or "upload"
 * 
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Script uploaded successfully",
 *       "scriptId": "script_12345",
 *       "data": {
 *         "projectName": "My Project",
 *         "language": "french",
 *         "content": "Script content here...",
 *         "fileName": "script.txt",
 *         "fileSize": 1024
 *       }
 *     }
 * 
 * @apiErrorExample {json} Error Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Project name is required"
 *     }
 * 
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "File size exceeds 100MB limit"
 *     }
 * 
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Only TXT and DOCX files are allowed"
 *     }
 * 
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "Failed to process uploaded file"
 *     }
 */
export async function POST(request: NextRequest) {
    try {
        // Get user session/authentication
        // const session = await getServerSession(authOptions)
        // if (!session?.user?.id) {
        //     return NextResponse.json(
        //         { error: 'Authentication required' },
        //         { status: StatusCodes.UNAUTHORIZED }
        //     )
        // }

        const contentType = request.headers.get('content-type') || '';
        
        let projectName: string;
        let language: string;
        let content: string = '';
        let mode: 'manual' | 'upload';
        let fileName: string | undefined;
        let fileSize: number | undefined;
        let fileType: string | undefined;
        let userId: number;

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            projectName = formData.get('projectName') as string;
            language = formData.get('language') as string;
            mode = formData.get('mode') as 'manual' | 'upload';
            userId = parseInt(formData.get('userId') as string); 
            const file = formData.get('file') as File;

            if (mode === 'upload') {
                if (!file || file.size === 0) {
                    return NextResponse.json(
                        { error: 'File is required for upload mode' },
                        { status: StatusCodes.BAD_REQUEST }
                    );
                }

                if (file.size > MAX_FILE_SIZE) {
                    return NextResponse.json(
                        { error: 'File size exceeds 100MB limit' },
                        { status: StatusCodes.BAD_REQUEST }
                    );
                }

                const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
                if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
                    return NextResponse.json(
                        { error: 'Only TXT and DOCX files are allowed' },
                        { status: StatusCodes.BAD_REQUEST }
                    );
                }

                fileName = file.name;
                fileSize = file.size;
                fileType = fileExtension;

                try {
                    if (fileExtension === '.txt') {
                        content = await file.text();
                    } else if (fileExtension === '.docx') {
                        const arrayBuffer = await file.arrayBuffer();
                        content = '[DOCX file uploaded - parsing not implemented]';
                    }
                } catch (error) {
                    return NextResponse.json(
                        { error: 'Failed to process uploaded file' },
                        { status: StatusCodes.INTERNAL_SERVER_ERROR }
                    );
                }
            }
        } else {
            const body = await request.json();
            projectName = body.projectName;
            language = body.language;
            content = body.content || '';
            mode = body.mode;
            userId = body.userId; // Get userId from JSON body
        }

        const result = await uploadScript({
            projectName,
            language,
            content,
            mode,
            fileName,
            fileSize,
            fileType,
            userId // Pass userId to action
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: StatusCodes.BAD_REQUEST }
            );
        }

        return NextResponse.json(
            {
                success: result.success,
                message: result.message,
                scriptId: result.scriptId,
                data: result.data
            },
            { status: StatusCodes.OK }
        );

    } catch (error) {
        console.error('Upload Script API Route Error:', error);
        
        const errorMessage = error instanceof Error 
            ? error.message 
            : 'Internal Server Error';
            
        return NextResponse.json(
            { error: errorMessage },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const scriptId = searchParams.get('scriptId');

        if (!scriptId) {
            return NextResponse.json(
                { error: 'Script ID is required' },
                { status: StatusCodes.BAD_REQUEST }
            );
        }

        // You can implement getScript here if needed
        // const result = await getScript(scriptId);

        return NextResponse.json(
            {
                success: true,
                message: 'GET endpoint - implement getScript if needed'
            },
            { status: StatusCodes.OK }
        );

    } catch (error) {
        console.error('Get Script API Route Error:', error);
        
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}