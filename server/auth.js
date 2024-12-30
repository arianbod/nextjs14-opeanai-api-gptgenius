// server/auth.js
'use server';

import prisma from '@/prisma/db';
import crypto from 'crypto';

const ANIMALS = [
    'dog', 'cat', 'elephant', 'lion', 'tiger', 'bear',
    'monkey', 'giraffe', 'zebra', 'penguin', 'kangaroo', 'koala'
];
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export async function generateToken(type = 'auth') {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(32).toString('hex');
    return crypto.createHash('sha256').update(`${timestamp}${random}${type}`).digest('hex');
}

export async function hashValue(value) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(value, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

export async function verifyHash(value, hashedValue) {
    const [salt, hash] = hashedValue.split(':');
    const verifyHash = crypto.pbkdf2Sync(value, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
}

export async function generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
}

export async function checkEmailVerification(userId) {
    if (!userId) return false;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { isEmailVerified: true }
        });

        return user?.isEmailVerified || false;
    } catch (error) {
        console.error('Database verification check error:', error);
        return false;
    }
}

export async function checkUserStatus(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            status: true,
            statusReason: true,
            loginAttempts: true,
            lastLoginAttempt: true
        }
    });

    if (!user) return { isValid: false, reason: 'User not found' };

    if (user.status === 'DELETED') {
        return { isValid: false, reason: 'Account has been deleted' };
    }

    if (user.status === 'INACTIVE') {
        return { isValid: false, reason: user.statusReason || 'Account is inactive' };
    }

    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS && user.lastLoginAttempt) {
        const lockoutEnd = new Date(user.lastLoginAttempt.getTime() + LOCKOUT_DURATION);
        if (new Date() < lockoutEnd) {
            return {
                isValid: false,
                reason: 'Account is temporarily locked',
                lockoutEnd
            };
        }
    }

    return { isValid: true };
}

export async function createUser(animalSelection, email = null, ipAddress = null, userAgent = null) {
    try {
        console.log("Starting user creation...");
        console.log("Received data:", { animalSelection, email, ipAddress, userAgent });

        // Validation for animal selection
        if (!Array.isArray(animalSelection) || animalSelection.length !== 3) {
            console.error("Invalid animal selection:", animalSelection);
            throw new Error('Invalid animal selection: must select exactly 3 animals');
        }

        animalSelection.forEach(animal => {
            if (!ANIMALS.includes(animal)) {
                console.error("Invalid animal:", animal);
                throw new Error(`Invalid animal selected: ${animal}`);
            }
        });

        // If email is provided, check for duplicate accounts
        if (email) {
            console.log("Validating email:", email);
            const existingUser = await prisma.user.findUnique({
                where: { email },
                select: { isEmailVerified: true }
            });

            if (existingUser?.isEmailVerified) {
                console.error("Email is already verified:", email);
                throw new Error('Email is already verified by another user');
            }
        } else {
            console.log("No email provided, proceeding with optional email.");
        }

        console.log("Generating tokens and hashes...");
        const token = await generateToken('auth');
        const hashedToken = await hashValue(token);
        const hashedAnimalSelection = await hashValue(animalSelection.join('|'));
        const verificationToken = email ? await generateToken('verify') : null;

        console.log("Preparing data for database insertion...");
        const userData = {
            token: hashedToken,
            animalSelection: hashedAnimalSelection,
            email, // Optional email
            tokenBalance: 3000,
            loginAttempts: 0,
            status: 'ACTIVE',
            statusReason: 'Account created',
            verificationToken,
            verificationTokenExpiry: verificationToken
                ? new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY)
                : null,
            lastIpAddress: ipAddress,
            lastUserAgent: userAgent,
            statusHistory: [{
                status: 'ACTIVE',
                reason: 'Account created',
                timestamp: new Date().toISOString()
            }],
            loginHistory: [{
                action: 'ACCOUNT_CREATED',
                ipAddress,
                userAgent,
                timestamp: new Date().toISOString()
            }],
            userPreferences: {
                create: {
                    currentLanguage: 'en',
                    isSidebarPinned: true,
                    languageHistory: [{
                        code: 'en',
                        name: 'English',
                        lastUsed: new Date().toISOString(),
                        useCount: 1
                    }],
                    userAgentHistory: userAgent ? [{
                        browser: userAgent.match(/(?:firefox|opera|safari|chrome|msie|trident(?=\/))\/\s*(\d+)/i)?.[1] || 'Unknown',
                        os: 'Unknown',
                        device: /mobile|tablet|android/i.test(userAgent) ? 'Mobile' : 'Desktop',
                        timestamp: new Date().toISOString()
                    }] : []
                }
            }
        };

        console.log("Final prepared user data:", JSON.stringify(userData, null, 2));

        console.log("Creating user in database...");
        const user = await prisma.user.create({
            data: userData,
            include: {
                userPreferences: true
            }
        });

        console.log("User created successfully:", user);
        return {
            userId: user.id,
            token,
            tokenBalance: user.tokenBalance,
            animalSelection,
            verificationToken,
            verificationTokenExpiry: user.verificationTokenExpiry,
            preferences: user.UserPreferences
        };
    } catch (error) {
        console.error("createUser error message:", error?.message);
        // or console.error("createUser error:", String(error));
        throw error;
    }
}




export async function authenticateUser(token, animalSelection, ipAddress = null, userAgent = null) {
    if (!Array.isArray(animalSelection) || animalSelection.length !== 3) {
        return {
            success: false,
            message: 'Please select exactly 3 animals in order'
        };
    }

    for (const animal of animalSelection) {
        if (!ANIMALS.includes(animal)) {
            return {
                success: false,
                message: `Invalid animal selected: ${animal}`
            };
        }
    }

    const users = await prisma.user.findMany();
    let user = null;

    for (const u of users) {
        if (await verifyHash(token, u.token)) {
            user = u;
            break;
        }
    }

    if (!user) {
        return {
            success: false,
            message: 'Invalid authentication token',
            remainingAttempts: MAX_LOGIN_ATTEMPTS
        };
    }

    const statusCheck = await checkUserStatus(user.id);
    if (!statusCheck.isValid) {
        return {
            success: false,
            message: statusCheck.reason,
            lockoutEnd: statusCheck.lockoutEnd
        };
    }

    const animalSelectionString = animalSelection.join('|');
    const animalSelectionVerified = await verifyHash(animalSelectionString, user.animalSelection);

    if (!animalSelectionVerified) {
        const newAttempts = (user.loginAttempts || 0) + 1;
        await prisma.user.update({
            where: { id: user.id },
            data: {
                loginAttempts: newAttempts,
                lastLoginAttempt: new Date(),
                loginHistory: {
                    push: [{
                        action: 'FAILED_LOGIN',
                        reason: 'Invalid animal sequence',
                        ipAddress,
                        userAgent,
                        timestamp: new Date().toISOString()
                    }]
                }
            },
        });

        const remainingAttempts = MAX_LOGIN_ATTEMPTS - newAttempts;
        return {
            success: false,
            message: remainingAttempts > 0
                ? `Incorrect animal sequence. ${remainingAttempts} attempts remaining.`
                : 'Account locked due to too many failed attempts. Please try again in 15 minutes.',
            remainingAttempts,
            isLocked: remainingAttempts <= 0
        };
    }

    const newToken = await generateToken('auth');
    const hashedToken = await hashValue(newToken);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            loginAttempts: 0,
            lastLoginAttempt: null,
            token: hashedToken,
            lastTokenRotation: new Date(),
            tokenVersion: { increment: 1 },
            lastIpAddress: ipAddress,
            lastUserAgent: userAgent,
            loginHistory: {
                push: [{
                    action: 'SUCCESSFUL_LOGIN',
                    ipAddress,
                    userAgent,
                    timestamp: new Date().toISOString()
                }]
            }
        },
    });

    const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
            id: true,
            tokenBalance: true,
            isEmailVerified: true,
            email: true
        },
    });

    return {
        success: true,
        userId: updatedUser.id,
        tokenBalance: updatedUser.tokenBalance,
        token: newToken,
        isEmailVerified: updatedUser.isEmailVerified,
        email: updatedUser.email,
        message: 'Login successful! A new token has been generated for security. Please save it.',
    };
}


// New function for email verification
export async function verifyEmail(userId, token) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            verificationToken: true,
            verificationTokenExpiry: true,
            email: true,
            isEmailVerified: true
        }
    });

    if (!user) {
        return { success: false, message: 'User not found' };
    }

    if (user.isEmailVerified) {
        return { success: false, message: 'Email is already verified' };
    }

    if (!user.verificationToken || !user.verificationTokenExpiry) {
        return { success: false, message: 'No verification pending' };
    }

    if (user.verificationToken !== token) {
        return { success: false, message: 'Invalid verification token' };
    }

    if (new Date() > user.verificationTokenExpiry) {
        return { success: false, message: 'Verification token has expired' };
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            isEmailVerified: true,
            verificationToken: null,
            verificationTokenExpiry: null,
            statusHistory: {
                push: [{
                    action: 'EMAIL_VERIFIED',
                    timestamp: new Date().toISOString()
                }]
            }
        }
    });

    return { success: true, message: 'Email verified successfully' };
}

// New function to update user status
export async function updateUserStatus(userId, newStatus, reason, updatedBy) {
    const statusCheck = await checkUserStatus(userId);
    if (!statusCheck.isValid && newStatus !== 'ACTIVE') {
        throw new Error(`Cannot update status: ${statusCheck.reason}`);
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            status: newStatus,
            statusReason: reason,
            statusUpdatedAt: new Date(),
            statusUpdatedBy: updatedBy,
            statusHistory: {
                push: [{
                    status: newStatus,
                    reason,
                    updatedBy,
                    timestamp: new Date().toISOString()
                }]
            }
        }
    });

    return { success: true, message: `Status updated to ${newStatus}` };
}

export async function getUserById(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            tokenBalance: true,
            status: true,
            isEmailVerified: true,
            lastTokenRotation: true
        },
    });
    return user;
}