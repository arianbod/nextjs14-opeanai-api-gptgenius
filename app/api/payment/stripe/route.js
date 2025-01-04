import { NextResponse } from 'next/server';
import { stripe, formatAmountForStripe, formatAmountFromStripe } from '@/lib/payment/stripe';
import { getUserById } from '@/server/auth';
import { createPaymentRecord, processPaymentCompletion, recordPaymentFailure } from '@/server/payments';

// Create checkout session
export async function POST(request) {
    console.log('Received POST request to create checkout session');

    try {
        const requestData = await request.json();
        console.log('Parsed request data:', {
            ...requestData,
            userId: requestData.userId ? '***' + requestData.userId.slice(-4) : undefined
        });

        const { amount, userId, tokenAmount, packageName, lang } = requestData;

        // Validate required fields
        if (!userId || !amount || !tokenAmount) {
            console.error('Missing required fields:', { userId: !!userId, amount: !!amount, tokenAmount: !!tokenAmount });
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get user and validate
        const user = await getUserById(userId);
        if (!user) {
            console.error('User not found:', { userId: '***' + userId.slice(-4) });
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log('Creating Stripe session and payment record');

        // Format amount for Stripe (converts to cents)
        const stripeAmount = formatAmountForStripe(amount);

        // Create Stripe session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: packageName || 'Token Package',
                            description: `${tokenAmount} Tokens`,
                        },
                        unit_amount: stripeAmount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            // Change the success_url to match your folder structure
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/token/success/{CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/token/cancel`,
            metadata: {
                userId,
                tokenAmount,
                packageName,
                originalAmount: amount.toString(),
            },
        });

        // Create payment record in database
        const paymentRecord = await createPaymentRecord({
            userId,
            type: 'TOKEN_PURCHASE',
            packageName,
            amount: parseFloat(amount),
            tokenAmount,
            currency: 'usd',
            previousBalance: user.tokenBalance,
            expectedBalance: user.tokenBalance + tokenAmount,
            stripeSessionId: session.id,
            paymentMethod: 'card',
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent'),
            metadata: {
                stripeSession: {
                    id: session.id,
                    created: new Date().toISOString(),
                    amountFormatted: formatAmountFromStripe(stripeAmount),
                },
                package: {
                    name: packageName,
                    tokens: tokenAmount,
                    originalAmount: amount,
                }
            }
        });

        if (!paymentRecord.success) {
            console.error('Failed to create payment record:', paymentRecord.error);
            throw new Error('Failed to create payment record');
        }

        console.log('Payment initialization successful:', {
            sessionId: session.id,
            amount: formatAmountFromStripe(stripeAmount),
            tokenAmount,
        });

        return NextResponse.json({ sessionId: session.id });
    } catch (error) {
        console.error('Payment initialization error:', {
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            timestamp: new Date().toISOString()
        });

        return NextResponse.json(
            {
                error: 'Failed to initialize payment',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

// Verify payment status
export async function GET(request) {
    console.log('Received payment verification request');

    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            console.error('Missing session ID in verification request');
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        console.log('Retrieving Stripe session:', { sessionId: sessionId.slice(0, 4) + '***' });

        // Get session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent']
        });

        console.log('Session retrieved:', {
            paymentStatus: session.payment_status,
            hasPaymentIntent: !!session.payment_intent
        });

        if (session.payment_status === 'paid') {
            // Process the successful payment
            const result = await processPaymentCompletion(sessionId);

            if (!result.success) {
                console.error('Failed to process payment completion:', result.error);
                throw new Error(result.error || 'Failed to process payment completion');
            }

            console.log('Payment processed successfully:', {
                tokenAmount: result.payment.tokenAmount,
                newBalance: result.payment.finalBalance
            });

            return NextResponse.json({
                success: true,
                paid: true,
                tokenAmount: result.payment.tokenAmount,
                finalBalance: result.payment.finalBalance
            });
        } else if (session.payment_status === 'failed' || session.payment_status === 'canceled') {
            // Record the payment failure
            await recordPaymentFailure(sessionId, {
                message: session.payment_status === 'failed'
                    ? 'Payment failed'
                    : 'Payment was canceled',
                code: session.payment_status.toUpperCase()
            });

            console.log('Payment not successful:', { status: session.payment_status });

            return NextResponse.json({
                success: true,
                paid: false,
                status: session.payment_status
            });
        }

        // Payment is still pending or in another state
        console.log('Payment status pending:', { status: session.payment_status });

        return NextResponse.json({
            success: true,
            paid: false,
            status: session.payment_status
        });
    } catch (error) {
        console.error('Payment verification error:', {
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            timestamp: new Date().toISOString()
        });

        return NextResponse.json(
            {
                error: 'Failed to verify payment status',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}