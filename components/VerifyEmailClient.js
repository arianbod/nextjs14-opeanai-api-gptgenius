'use client';
// app/[lang]/(dashboard)/verify-email/VerifyEmailClient.js

import { useAuth } from '@/context/AuthContext';
import { useTranslations } from '@/context/TranslationContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Loading from '@/components/Loading';

const VerifyEmailClient = () => {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const dict = useTranslations();

    const [verificationState, setVerificationState] = useState({
        status: 'verifying',
        error: ''
    });

    const handleHomeRedirect = useCallback(() => {
        const lang = window.location.pathname.split('/')[1] || 'en';
        // After verification, redirect and force refresh
        router.push(`/${lang}`);
        setTimeout(() => {
            window.location.reload();
        }, 100);
    }, [router]);

    const verifyToken = useCallback(async (token, userId) => {
        if (!token || !userId) {
            setVerificationState({
                status: 'error',
                error: dict.auth.errors.email.verificationInvalid
            });
            return;
        }

        try {
            console.log('Attempting to verify token:', { token: token.slice(0, 8), userId });

            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, userId })
            });

            const data = await response.json();
            console.log('Verification response:', data);

            if (data.success) {
                setVerificationState({
                    status: 'success',
                    error: ''
                });

                // After successful verification, wait 2 seconds then redirect
                setTimeout(() => {
                    handleHomeRedirect();
                }, 2000);
            } else {
                setVerificationState({
                    status: 'error',
                    error: data.error || dict.auth.errors.email.verificationFailed
                });
            }
        } catch (error) {
            console.error('Verification error:', error);
            setVerificationState({
                status: 'error',
                error: dict.auth.errors.generic
            });
        }
    }, [dict.auth.errors, handleHomeRedirect]);

    useEffect(() => {
        const token = searchParams.get('token');
        const userId = searchParams.get('userId');
        verifyToken(token, userId);
    }, [searchParams, verifyToken]);

    if (verificationState.status === 'verifying') {
        return <Loading />;
    }

    const { status, error } = verificationState;

    return (
        <main className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-md w-full space-y-8'>
                <div className='text-center'>
                    {status === 'success' ? (
                        <>
                            <FaCheckCircle className='mx-auto h-12 w-12 text-green-500' />
                            <h1 className='mt-6 text-3xl font-extrabold text-gray-900 dark:text-white'>
                                {dict.auth.verificationSuccess}
                            </h1>
                            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
                                {dict.auth.redirecting}
                            </p>
                        </>
                    ) : (
                        <>
                            <FaExclamationTriangle className='mx-auto h-12 w-12 text-red-500' />
                            <h1 className='mt-6 text-3xl font-extrabold text-gray-900 dark:text-white'>
                                {dict.auth.verificationFailed}
                            </h1>
                            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
                                {error}
                            </p>
                            <div className='mt-4'>
                                <button
                                    onClick={handleHomeRedirect}
                                    type="button"
                                    className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                                >
                                    {dict.account.goToHome}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
};

export default VerifyEmailClient;