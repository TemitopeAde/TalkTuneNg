import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';

export async function initiatePayment(req: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.FLUTTERWAVE_SECRET_KEY) {
      console.error('Missing Flutterwave API keys');
      return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 });
    }

    const user = await authenticateRequest(req);
    if (!user) {
      console.log('Unauthorized: No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Authenticated user:', { id: user.id, email: user.email });

    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { planId, billingCycle } = body;

    if (!planId || !billingCycle) {
      console.error('Missing required fields:', { planId, billingCycle });
      return NextResponse.json({ error: 'Missing planId or billingCycle' }, { status: 400 });
    }

  const plans = [
    {
      id: "creator",
      monthlyPrice: 8,
    },
    {
      id: "pro",
      monthlyPrice: 13,
    },
    {
      id: "business",
      monthlyPrice: 48,
    },
  ];

    const plan = plans.find((p) => p.id === planId);

    if (!plan) {
      console.error('Plan not found:', planId);
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const getDisplayPrice = (monthlyPrice: number, cycle: 'monthly' | 'yearly') => {
      if (monthlyPrice === 0 && cycle === 'yearly') {
        return 'Custom';
      }
      return cycle === 'yearly' ? monthlyPrice * 12 : monthlyPrice;
    };

    const amount = getDisplayPrice(plan.monthlyPrice, billingCycle);

    if (amount === 'Custom') {
      console.log('Custom pricing requested for plan:', planId);
      return NextResponse.json({ error: 'Custom pricing, please contact us' }, { status: 400 });
    }

    const payload = {
      tx_ref: Date.now().toString(),
      amount,
      currency: 'USD',
      redirect_url: process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscriptions`
        : 'http://localhost:3000/dashboard/subscriptions',
      customer: {
        email: user.email,
        phonenumber: user.phoneNumber || '',
        name: user.name || '',
      },
      customizations: {
        title: 'Talktune Subscription',
        description: `Payment for your Talktune ${planId} plan`,
        logo: 'https://www.talktune.co/logo.png',
      },
      meta: {
        planId: planId,
        billingCycle: billingCycle,
        userId: user.id,
      },
    };

    console.log('Initiating Flutterwave payment with payload:', {
      ...payload,
      customer: { email: user.email } // Only log email for privacy
    });

    // Use Flutterwave API directly to create a payment link
    const flutterwaveResponse = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await flutterwaveResponse.json();
    console.log('Flutterwave API response:', data);

    if (!flutterwaveResponse.ok) {
      console.error('Flutterwave API error:', data);
      return NextResponse.json({
        error: 'Payment initiation failed',
        details: data.message || 'Unknown error from Flutterwave'
      }, { status: flutterwaveResponse.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in initiatePayment:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
