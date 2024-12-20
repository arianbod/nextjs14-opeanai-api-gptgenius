'use client';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from '@/context/TranslationContext';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Loading from '@/components/Loading';

const VerifyEmailPage = () => {
    const { verifyEmail, user } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const dict = useTranslations();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [error, setError] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        const userId = searchParams.get('userId');

        if (!token || !userId) {
            setStatus('error');
            setError('Invalid verification link');
            return;
        }

        const verifyToken = async () => {
            try {
                const result = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, userId })
                });

                const data = await result.json();

                if (data.success) {
                    setStatus('success');
                    // Redirect after 3 seconds
                    setTimeout(() => {
                        router.push('/account');
                    }, 3000);
                } else {
                    setStatus('error');
                    setError(data.error || 'Verification failed');
                }
            } catch (error) {
                setStatus('error');
                setError('An error occurred during verification');
            }
        };

        verifyToken();
    }, [searchParams, router]);

    if (status === 'verifying') {
        return <Loading />;
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-md w-full space-y-8'>
                <div className='text-center'>
                    {status === 'success' ? (
                        <>
                            <FaCheckCircle className='mx-auto h-12 w-12 text-green-500' />
                            <h2 className='mt-6 text-3xl font-extrabold text-gray-900 dark:text-white'>
                                Email Verified Successfully
                            </h2>
                            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
                                Your email has been verified. Redirecting to account page...
                            </p>
                        </>
                    ) : (
                        <>
                            <FaExclamationTriangle className='mx-auto h-12 w-12 text-red-500' />
                            <h2 className='mt-6 text-3xl font-extrabold text-gray-900 dark:text-white'>
                                Verification Failed
                            </h2>
                            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
                                {error}
                            </p>
                            <div className='mt-4'>
                                <button
                                    onClick={() => router.push('/account')}
                                    className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                >
                                    Go to Account
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;