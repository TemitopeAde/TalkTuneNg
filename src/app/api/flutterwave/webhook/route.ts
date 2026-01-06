import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * @swagger
 * /api/flutterwave/webhook:
 *   post:
 *     summary: Handle Flutterwave payment webhooks
 *     description: Receives payment notifications from Flutterwave and updates user subscriptions
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook signature or payload
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('flutterwave-signature');

    console.log('Webhook received');
    console.log('Signature:', signature);

    // Verify webhook signature
    if (!process.env.FLUTTERWAVE_SECRET_HASH) {
      console.error('FLUTTERWAVE_SECRET_HASH is not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    if (signature !== process.env.FLUTTERWAVE_SECRET_HASH) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Parse the webhook payload
    const payload = JSON.parse(body);
    console.log('Webhook payload:', {
      event: payload.event,
      txRef: payload.data?.tx_ref,
      status: payload.data?.status,
    });

    // Handle the charge.completed event
    if (payload.event === 'charge.completed') {
      const { status, tx_ref, customer, amount, currency } = payload.data;

      if (status === 'successful') {
        console.log('Payment successful:', { tx_ref, customer: customer.email, amount, currency });

        // Extract plan ID from tx_ref or metadata
        // You might want to store additional metadata in the payment to identify the plan
        const planId = payload.data.meta?.planId || 'creator'; // Default or extract from metadata

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: customer.email },
        });

        if (!user) {
          console.error('User not found for email:', customer.email);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update user subscription
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionPlan: planId,
          },
        });

        console.log('User subscription updated:', { userId: user.id, planId });

        // TODO: You might want to create a payment record in your database
        // await prisma.payment.create({
        //   data: {
        //     userId: user.id,
        //     txRef: tx_ref,
        //     amount,
        //     currency,
        //     status: 'completed',
        //     planId,
        //   },
        // });

        return NextResponse.json({
          success: true,
          message: 'Subscription updated successfully'
        });
      } else {
        console.log('Payment not successful:', { status, tx_ref });
        return NextResponse.json({
          success: false,
          message: 'Payment not successful'
        });
      }
    }

    // For other events, just acknowledge
    console.log('Webhook event not handled:', payload.event);
    return NextResponse.json({ success: true, message: 'Event received' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
