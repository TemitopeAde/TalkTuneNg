import { NextRequest, NextResponse } from 'next/server'
import { StatusCodes } from 'http-status-codes'

/**
 * @api {post} /api/webhooks Receive webhook
 * @apiName ReceiveWebhook
 * @apiGroup Webhooks
 * 
 * @apiBody {Any} * Any webhook payload
 * 
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "received": true
 *     }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        
        // Log the webhook for debugging
        console.log('Webhook received:', {
            timestamp: new Date().toISOString(),
            payload: body
        })

        // Simply return 200 OK
        return NextResponse.json(
            { received: true },
            { status: StatusCodes.OK }
        )
    } catch (error) {
        console.error('Webhook error:', error)
        
        // Still return 200 even if there's an error
        return NextResponse.json(
            { received: true },
            { status: StatusCodes.OK }
        )
    }
}