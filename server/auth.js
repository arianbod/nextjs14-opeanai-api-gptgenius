// server/auth.js
import prisma from '@/prisma/db';
import crypto from 'crypto';

const ANIMALS = [
    'dog', 'cat', 'elephant', 'lion', 'tiger', 'bear',
    'monkey', 'giraffe', 'zebra', 'penguin', 'kangaroo', 'koala'
];
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export function generateToken() {
    return crypto.randomBytes(16).toString('hex');
}

export function hashValue(value) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(value, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

export function verifyHash(value, hashedValue) {
    const [salt, hash] = hashedValue.split(':');
    const verifyHash = crypto.pbkdf2Sync(value, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
}

export async function createUser(animalSelection, email = null) {
    const token = generateToken();
    const hashedToken = hashValue(token);
    const hashedAnimalSelection = hashValue(animalSelection.join(','));

    const user = await prisma.user.create({
        data: {
            token: hashedToken,
            animalSelection: hashedAnimalSelection,
            email,
            tokenBalance: 3000, // Default token balance
        },
    });

    return {
        userId: user.id,
        token,
        tokenBalance: user.tokenBalance,
        animalSelection, // Return the original (unhashed) animal selection
    };
}

export async function authenticateUser(token, animalSelection) {
    console.log('Authenticating user with token:', token, 'and animals:', animalSelection);

    // Find the user
    const users = await prisma.user.findMany();
    console.log('All users:', users.map(u => ({ id: u.id, tokenPrefix: u.token.slice(0, 8) })));

    let user = null;
    for (const u of users) {
        if (verifyHash(token, u.token)) {
            user = u;
            break;
        }
    }

    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
        console.log('User details:', {
            id: user.id,
            tokenPrefix: user.token.slice(0, 8),
            loginAttempts: user.loginAttempts,
            lastLoginAttempt: user.lastLoginAttempt
        });
    }

    if (!user) {
        return { success: false, message: 'User not found' };
    }

    if (
        user.loginAttempts >= MAX_LOGIN_ATTEMPTS &&
        user.lastLoginAttempt &&
        new Date().getTime() - user.lastLoginAttempt.getTime() < LOCKOUT_DURATION
    ) {
        console.log('Account locked');
        return { success: false, message: 'Account is temporarily locked. Please try again later.' };
    }

    const animalSelectionVerified = verifyHash(animalSelection.join(','), user.animalSelection);

    console.log('Animal selection verified:', animalSelectionVerified);

    if (!animalSelectionVerified) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                loginAttempts: user.loginAttempts + 1,
                lastLoginAttempt: new Date(),
            },
        });
        return { success: false, message: 'Invalid animal selection' };
    }

    // Reset login attempts on successful authentication
    await prisma.user.update({
        where: { id: user.id },
        data: {
            loginAttempts: 0,
            lastLoginAttempt: null,
        },
    });

    // Generate new token but keep the same animal selection
    const newToken = generateToken();
    const hashedToken = hashValue(newToken);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            token: hashedToken,
        },
    });

    // Fetch updated user data
    const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, tokenBalance: true },
    });

    console.log('Authentication successful');

    return {
        success: true,
        userId: updatedUser.id,
        tokenBalance: updatedUser.tokenBalance,
        token: newToken, // Return the new token to the client
        message: 'Authentication successful. Please note your new token.',
    };
}

export async function getUserById(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, tokenBalance: true },
    });
    return user;
}
