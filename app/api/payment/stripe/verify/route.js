import { NextResponse } from 'next/server';
import { stripe } from '@/lib/payment/stripe';
import { processPaymentCompletion, recordPaymentFailure } from '@/server/payments';
import { updateUserTokenBalance } from '@/server/tokens';

export async function GET(request) {
    console.log('Received payment verification request');

    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');

        console.log('Verifying session:', {
            sessionId: sessionId ? sessionId.slice(0, 4) + '***' : undefined
        });

        if (!sessionId) {
            console.error('No session ID provided');
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        // Get session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent']
        });

        console.log('Session retrieved:', {
            paymentStatus: session.payment_status,
            hasPaymentIntent: !!session.payment_intent,
            metadata: session.metadata
        });

        if (session.payment_status === 'paid') {
            // Process the successful payment using our server action
            const result = await processPaymentCompletion(sessionId);

            if (!result.success) {
                console.error('Failed to process payment completion:', result.error);
                throw new Error(result.error || 'Failed to process payment completion');
            }

            // Double check token balance update
            const { userId, tokenAmount } = session.metadata;
            await updateUserTokenBalance(userId, parseInt(tokenAmount));

            console.log('Payment processed successfully:', {
                tokenAmount: result.payment.tokenAmount,
                finalBalance: result.payment.finalBalance,
                userId: userId ? '***' + userId.slice(-4) : undefined
            });

            return NextResponse.json({
                success: true,
                paid: true,
                tokenAmount: result.payment.tokenAmount,
                finalBalance: result.payment.finalBalance
            });
        }

        if (session.payment_status === 'failed' || session.payment_status === 'canceled') {
            // Record the failure using our server action
            await recordPaymentFailure(sessionId, {
                message: session.payment_status === 'failed'
                    ? 'Payment failed'
                    : 'Payment was canceled',
                code: session.payment_status.toUpperCase()
            });

            return NextResponse.json({
                success: true,
                paid: false,
                status: session.payment_status
            });
        }

        // Payment is still pending
        console.log('Payment status pending:', { status: session.payment_status });
        return NextResponse.json({
            success: true,
            paid: false,
            status: session.payment_status
        });

    } catch (error) {
        console.error('Payment verification error:', {
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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