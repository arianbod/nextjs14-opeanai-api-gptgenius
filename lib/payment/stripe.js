import Stripe from 'stripe';

console.log('Initializing Stripe with config:', {
    apiVersion: '2023-10-16',
    appInfo: {
        name: 'BabaGPT',
        version: '0.1.0'
    },
    secretKeyLength: process.env.STRIPE_SECRET_KEY?.length || 0
});

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    appInfo: {
        name: 'BabaGPT',
        version: '0.1.0'
    }
});

// Log Stripe instance creation
console.log('Stripe instance created:', {
    isInitialized: !!stripe,
    hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
});

// Helper function to format amount for Stripe (converts to cents)
export const formatAmountForStripe = (amount, currency = 'usd') => {
    console.log('Formatting amount for Stripe:', { amount, currency });

    const currencies = ['usd', 'eur', 'gbp'];
    const numericalAmount = parseFloat(amount);

    console.log('Parsed amount:', {
        original: amount,
        parsed: numericalAmount,
        isValid: !isNaN(numericalAmount)
    });

    if (isNaN(numericalAmount)) {
        console.error('Invalid amount provided:', amount);
        throw new Error('Invalid amount');
    }

    const stripeAmount = Math.round(numericalAmount * 100);
    console.log('Converted to cents:', {
        original: numericalAmount,
        inCents: stripeAmount
    });

    if (stripeAmount < 50) {
        console.error('Amount below minimum:', {
            amountInCents: stripeAmount,
            minimumRequired: 50
        });
        throw new Error('Amount must be at least 0.50');
    }

    console.log('Final formatted amount:', {
        originalAmount: amount,
        formattedAmount: stripeAmount,
        currency
    });

    return stripeAmount;
};

// Helper function to format amount from Stripe (converts from cents)
export const formatAmountFromStripe = (amount, currency = 'usd') => {
    console.log('Formatting amount from Stripe cents:', {
        amountInCents: amount,
        currency
    });

    const formattedAmount = (amount / 100).toFixed(2);

    console.log('Converted amount:', {
        original: amount,
        formatted: formattedAmount,
        currency
    });

    return formattedAmount;
};

// Validate Stripe webhook signature
export const validateStripeWebhook = (rawBody, sig, secret) => {
    console.log('Validating webhook signature:', {
        hasBody: !!rawBody,
        bodyLength: rawBody?.length,
        hasSignature: !!sig,
        hasSecret: !!secret,
        secretLength: secret?.length
    });

    try {
        const event = stripe.webhooks.constructEvent(rawBody, sig, secret);
        console.log('Webhook validated successfully:', {
            eventType: event.type,
            eventId: event.id,
            timestamp: new Date(event.created * 1000).toISOString()
        });
        return event;
    } catch (err) {
        console.error('Webhook validation failed:', {
            error: err.message,
            type: err.type,
            stack: err.stack
        });
        throw new Error(`Webhook Error: ${err.message}`);
    }
};

// Test connection to Stripe
(async () => {
    try {
        const testConnection = await stripe.paymentMethods.list({ limit: 1 });
        console.log('Successfully connected to Stripe API:', {
            hasData: !!testConnection.data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Failed to connect to Stripe:', {
            error: error.message,
            type: error.type,
            timestamp: new Date().toISOString()
        });
    }
})();

// Export configuration
export const stripeConfig = {
    isInitialized: !!stripe,
    apiVersion: '2023-10-16',
    currency: 'usd',
    minimumAmount: 0.5,
    hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
    hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    environment: process.env.NODE_ENV
};

console.log('Stripe configuration exported:', stripeConfig);