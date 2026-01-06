import { NextRequest } from 'next/server';
import { initiatePayment } from '@/actions/payment';

/**
 * @swagger
 * /api/flutterwave/payment:
 *   post:
 *     summary: Initiate a payment with Flutterwave
 *     description: Creates a payment request with Flutterwave and returns a payment link.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planId:
 *                 type: string
 *                 description: The ID of the subscription plan.
 *               billingCycle:
 *                 type: string
 *                 enum: [monthly, yearly]
 *                 description: The billing cycle for the subscription.
 *     responses:
 *       200:
 *         description: Payment link created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Hosted Link
 *                 data:
 *                   type: object
 *                   properties:
 *                     link:
 *                       type: string
 *                       format: uri
 *                       example: https://ravemodal-dev.herokuapp.com/v3/hosted/pay/xxxxxxxxx
 *       400:
 *         description: Bad request, such as for a custom pricing plan.
 *       401:
 *         description: Unauthorized, user is not authenticated.
 *       404:
 *         description: User or plan not found.
 *       500:
 *         description: Internal server error.
 */
export async function POST(req: NextRequest) {
  return initiatePayment(req);
}
