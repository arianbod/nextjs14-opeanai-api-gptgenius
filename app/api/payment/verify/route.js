import { NextResponse } from 'next/server';
import { stripe } from '@/lib/payment/stripe';
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

        console.log('Retrieving session from Stripe');
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        console.log('Session retrieved:', {
            paymentStatus: session.payment_status,
            paymentIntent: session.payment_intent ? 'present' : 'absent',
            metadata: {
                tokenAmount: session.metadata?.tokenAmount,
                userId: session.metadata?.userId ? '***' + session.metadata.userId.slice(-4) : undefined
            }
        });

        if (session.payment_status === 'paid') {
            const { userId, tokenAmount } = session.metadata;

            console.log('Processing successful payment:', {
                userId: '***' + userId.slice(-4),
                tokenAmount,
                sessionId: sessionId.slice(0, 4) + '***'
            });

            // Verify payment intent to ensure payment was successful
            const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);

            if (paymentIntent.status === 'succeeded') {
                await updateUserTokenBalance(userId, parseInt(tokenAmount));
                console.log('Token balance updated successfully');

                return NextResponse.json({
                    success: true,
                    paid: true,
                    tokenAmount
                });
            }
        }

        console.log('Payment incomplete:', {
            status: session.payment_status,
            paymentIntent: session.payment_intent
        });

        return NextResponse.json({
            success: true,
            paid: false
        });

    } catch (error) {
        console.error('Payment verification error:', {
            error: error.message,
            type: error.type,
            code: error.code,
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