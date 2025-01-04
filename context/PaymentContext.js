'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useTranslations } from './TranslationContext';

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
    const { lang } = useTranslations()
    const router = useRouter();
    const { user, setTokenBalance } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);

    const initializePayment = useCallback(async (packageDetails) => {
        if (!user?.userId) {
            toast.error('Authentication required');
            return;
        }

        try {
            setIsProcessing(true);

            const response = await fetch('/api/payment/stripe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: packageDetails.price,
                    userId: user.userId,
                    tokenAmount: packageDetails.tokens,
                    packageName: packageDetails.name, lang
                }),
            });

            const { sessionId, error } = await response.json();

            if (error) {
                toast.error(error);
                return;
            }

            // Load Stripe
            const stripe = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
            const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });

            if (stripeError) {
                toast.error(stripeError.message);
            }
        } catch (error) {
            console.error('Payment initialization error:', error);
            toast.error('Failed to initialize payment');
        } finally {
            setIsProcessing(false);
        }
    }, [user?.userId]);

    const verifyPayment = useCallback(async (sessionId) => {
        try {
            const response = await fetch(`/api/payment/stripe/verify?session_id=${sessionId}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (data.paid) {
                setTokenBalance((prev) => prev + data.tokenAmount);
                return { success: true, tokenAmount: data.tokenAmount };
            }

            return { success: false };
        } catch (error) {
            console.error('Payment verification error:', error);
            return { success: false, error: error.message };
        }
    }, [setTokenBalance]);

    const value = {
        isProcessing,
        initializePayment,
        verifyPayment,
    };

    return (
        <PaymentContext.Provider value={value}>
            {children}
        </PaymentContext.Provider>
    );
};

export const usePayment = () => {
    const context = useContext(PaymentContext);
    if (!context) {
        throw new Error('usePayment must be used within a PaymentProvider');
    }
    return context;
};