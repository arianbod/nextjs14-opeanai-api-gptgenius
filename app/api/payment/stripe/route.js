import { NextResponse } from 'next/server';
import { stripe } from '@/lib/payment/stripe';
import { getUserById } from '@/server/auth';
import { updateUserTokenBalance } from '@/server/tokens';

// Create checkout session
export async function POST(request) {
    console.log('Received POST request to create checkout session');

    try {
        const requestData = await request.json();
        console.log('Parsed request data:', {
            ...requestData,
            userId: requestData.userId ? '***' + requestData.userId.slice(-4) : undefined
        });

        const { amount, userId, tokenAmount } = requestData;

        if (!userId || !amount || !tokenAmount) {
            console.error('Missing required fields:', { userId: !!userId, amount: !!amount, tokenAmount: !!tokenAmount });
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Log validation attempt
        console.log('Validating user:', {
            userId: '***' + userId.slice(-4),
            requestedTokens: tokenAmount
        });

        // Validate user exists
        const user = await getUserById(userId);
        if (!user) {
            console.error('User not found:', {
                userId: '***' + userId.slice(-4),
                timestamp: new Date().toISOString()
            });
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        console.log('User validated successfully:', {
            userId: '***' + userId.slice(-4),
            hasEmail: !!user.email
        });

        // Log session creation attempt
        console.log('Creating Stripe session:', {
            amount,
            tokenAmount,
            currency: 'usd'
        });

        // Create Stripe session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Tokens',
                            description: `${tokenAmount} Tokens`,
                        },
                        unit_amount: Math.round(amount * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/token/success?session_id={CHECKOUT_SESSION_ID}&tokens=${tokenAmount}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/token/cancel`,
            metadata: {
                userId,
                tokenAmount,
            },
        });

        console.log('Stripe session created successfully:', {
            sessionId: session.id,
            amount,
            tokenAmount,
            timestamp: new Date().toISOString()
        });

        return NextResponse.json({ sessionId: session.id });
    } catch (error) {
        console.error('Stripe session creation error:', {
            error: error.message,
            type: error.type,
            code: error.code,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            timestamp: new Date().toISOString()
        });

        return NextResponse.json(
            {
                error: 'Failed to create payment session',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

// Check session status and update tokens
export async function GET(request) {
    console.log('Received GET request to check session status');

    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');

        console.log('Checking session:', {
            sessionId: sessionId ? sessionId.slice(0, 4) + '***' : undefined
        });

        if (!sessionId) {
            console.error('No session ID provided');
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        console.log('Retrieving session from Stripe:', {
            sessionId: sessionId.slice(0, 4) + '***'
        });

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        console.log('Session retrieved:', {
            sessionId: session.id.slice(0, 4) + '***',
            paymentStatus: session.payment_status,
            metadata: {
                ...session.metadata,
                userId: session.metadata.userId ? '***' + session.metadata.userId.slice(-4) : undefined
            }
        });

        if (session.payment_status === 'paid') {
            const { userId, tokenAmount } = session.metadata;
            console.log('Processing successful payment:', {
                userId: '***' + userId.slice(-4),
                tokenAmount,
                sessionId: session.id.slice(0, 4) + '***'
            });

            await updateUserTokenBalance(userId, parseInt(tokenAmount));
            console.log('Token balance updated successfully');

            return NextResponse.json({
                success: true,
                paid: true,
                tokenAmount
            });
        }

        console.log('Payment not completed:', {
            sessionId: session.id.slice(0, 4) + '***',
            status: session.payment_status
        });

        return NextResponse.json({
            success: true,
            paid: false
        });

    } catch (error) {
        console.error('Error checking session:', {
            error: error.message,
            type: error.type,
            code: error.code,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            timestamp: new Date().toISOString()
        });

        return NextResponse.json(
            {
                error: 'Failed to check payment status',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}