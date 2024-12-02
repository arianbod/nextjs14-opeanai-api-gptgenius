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
    // Validate animal selection array
    if (!Array.isArray(animalSelection) || animalSelection.length !== 3) {
        throw new Error('Invalid animal selection: must select exactly 3 animals');
    }

    // Validate each animal in the selection
    animalSelection.forEach(animal => {
        if (!ANIMALS.includes(animal)) {
            throw new Error(`Invalid animal selected: ${animal}`);
        }
    });

    const token = generateToken();
    const hashedToken = hashValue(token);
    // Store animals in order by joining them with a delimiter
    const hashedAnimalSelection = hashValue(animalSelection.join('|'));

    const user = await prisma.user.create({
        data: {
            token: hashedToken,
            animalSelection: hashedAnimalSelection,
            email,
            tokenBalance: 3000, // Default token balance
            loginAttempts: 0,
            lastLoginAttempt: null
        },
    });

    return {
        userId: user.id,
        token,
        tokenBalance: user.tokenBalance,
        animalSelection, // Return original animal selection for confirmation
    };
}

export async function authenticateUser(token, animalSelection) {
    console.log('Authenticating user with token and ordered animals');

    // Validate animal selection
    if (!Array.isArray(animalSelection) || animalSelection.length !== 3) {
        return {
            success: false,
            message: 'Please select exactly 3 animals in order'
        };
    }

    // Validate each animal
    for (const animal of animalSelection) {
        if (!ANIMALS.includes(animal)) {
            return {
                success: false,
                message: `Invalid animal selected: ${animal}`
            };
        }
    }

    // Find the user
    const users = await prisma.user.findMany();
    let user = null;
    for (const u of users) {
        if (verifyHash(token, u.token)) {
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

    // Check for account lockout
    if (
        user.loginAttempts >= MAX_LOGIN_ATTEMPTS &&
        user.lastLoginAttempt &&
        new Date().getTime() - user.lastLoginAttempt.getTime() < LOCKOUT_DURATION
    ) {
        const remainingLockoutTime = Math.ceil(
            (LOCKOUT_DURATION - (new Date().getTime() - user.lastLoginAttempt.getTime())) / 60000
        );

        return {
            success: false,
            message: `Account is temporarily locked. Please try again in ${remainingLockoutTime} minutes.`,
            isLocked: true,
            remainingLockoutTime
        };
    }

    // Verify animal selection order
    const animalSelectionString = animalSelection.join('|');
    const animalSelectionVerified = verifyHash(animalSelectionString, user.animalSelection);

    if (!animalSelectionVerified) {
        // Increment login attempts
        const newAttempts = (user.loginAttempts || 0) + 1;
        await prisma.user.update({
            where: { id: user.id },
            data: {
                loginAttempts: newAttempts,
                lastLoginAttempt: new Date(),
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

    return {
        success: true,
        userId: updatedUser.id,
        tokenBalance: updatedUser.tokenBalance,
        token: newToken,
        message: 'Login successful! A new token has been generated for security. Please save it.',
    };
}

export async function getUserById(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, tokenBalance: true },
    });
    return user;
}