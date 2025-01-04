'use server';

import prisma from "@/prisma/db";
import { getUserById } from "./auth";
import { revalidatePath } from "next/cache";

/**
 * Create a new payment record
 */
export async function createPaymentRecord(paymentData) {
    try {
        const payment = await prisma.payment.create({
            data: {
                userId: paymentData.userId,
                type: paymentData.type || 'TOKEN_PURCHASE',
                packageName: paymentData.packageName,
                amount: paymentData.amount,
                tokenAmount: paymentData.tokenAmount,
                currency: paymentData.currency || 'usd',
                previousBalance: paymentData.previousBalance,
                expectedBalance: paymentData.expectedBalance,
                stripeSessionId: paymentData.stripeSessionId,
                status: 'PENDING',
                ipAddress: paymentData.ipAddress,
                userAgent: paymentData.userAgent,
                metadata: paymentData.metadata || {},
            },
        });

        return { success: true, payment };
    } catch (error) {
        console.error('Error creating payment record:', error);
        return { success: false, error: 'Failed to create payment record' };
    }
}

/**
 * Get user's payment history
 */
export async function getUserPaymentHistory(userId) {
    try {
        const payments = await prisma.payment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                refundFor: true,
                refunds: true,
            },
        });

        return { success: true, payments };
    } catch (error) {
        console.error('Error fetching payment history:', error);
        return { success: false, error: 'Failed to fetch payment history' };
    }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(paymentId, status, additionalData = {}) {
    try {
        const payment = await prisma.payment.update({
            where: { id: paymentId },
            data: {
                status,
                ...additionalData,
                updatedAt: new Date(),
                completedAt: status === 'COMPLETED' ? new Date() : undefined,
            },
        });

        // Revalidate relevant paths
        revalidatePath('/');
        revalidatePath('/token');

        return { success: true, payment };
    } catch (error) {
        console.error('Error updating payment status:', error);
        return { success: false, error: 'Failed to update payment status' };
    }
}

/**
 * Process payment completion
 */
export async function processPaymentCompletion(sessionId) {
    try {
        // Get payment record
        const payment = await prisma.payment.findUnique({
            where: { stripeSessionId: sessionId },
            include: { user: true }
        });

        if (!payment) {
            return { success: false, error: 'Payment record not found' };
        }

        // Update payment record
        const updatedPayment = await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                finalBalance: payment.expectedBalance,
                metadata: {
                    ...payment.metadata,
                    completedAt: new Date().toISOString(),
                }
            }
        });

        // Update user token balance
        const updatedUser = await prisma.user.update({
            where: { id: payment.userId },
            data: { tokenBalance: payment.expectedBalance }
        });

        // Revalidate relevant paths
        revalidatePath('/');
        revalidatePath('/token');

        return {
            success: true,
            payment: updatedPayment,
            tokenBalance: updatedUser.tokenBalance
        };
    } catch (error) {
        console.error('Error processing payment completion:', error);
        return { success: false, error: 'Failed to process payment completion' };
    }
}

/**
 * Record payment failure
 */
export async function recordPaymentFailure(sessionId, error) {
    try {
        const payment = await prisma.payment.update({
            where: { stripeSessionId: sessionId },
            data: {
                status: 'FAILED',
                error: error.message,
                errorCode: error.code,
                metadata: {
                    ...payment.metadata,
                    failureDetails: {
                        error: error.message,
                        code: error.code,
                        timestamp: new Date().toISOString()
                    }
                }
            }
        });

        return { success: true, payment };
    } catch (error) {
        console.error('Error recording payment failure:', error);
        return { success: false, error: 'Failed to record payment failure' };
    }
}

/**
 * Process payment refund
 */
export async function processPaymentRefund(paymentId, reason) {
    try {
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId }
        });

        if (!payment) {
            return { success: false, error: 'Payment not found' };
        }

        // Create refund record
        const refund = await prisma.payment.create({
            data: {
                userId: payment.userId,
                type: 'REFUND',
                amount: -payment.amount,
                tokenAmount: -payment.tokenAmount,
                currency: payment.currency,
                previousBalance: payment.finalBalance,
                expectedBalance: payment.finalBalance - payment.tokenAmount,
                status: 'COMPLETED',
                refundForId: payment.id,
                refundReason: reason,
                completedAt: new Date(),
            }
        });

        // Update user token balance
        await prisma.user.update({
            where: { id: payment.userId },
            data: { tokenBalance: { decrement: payment.tokenAmount } }
        });

        revalidatePath('/');
        return { success: true, refund };
    } catch (error) {
        console.error('Error processing refund:', error);
        return { success: false, error: 'Failed to process refund' };
    }
}