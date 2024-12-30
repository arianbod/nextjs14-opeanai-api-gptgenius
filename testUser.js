#!/usr/bin/env node

/**
 * This script tests creating a new User with UserPreferences in a
 * way that mimics the structure of your createUser function.
 *
 * Usage (from your project root):
 *    node scripts/testUserPreferencesCreation.js
 */

const { loadEnvConfig } = require('@next/env');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Starting the User + UserPreferences creation test...");

        // Typically you'd get these from a request body or generate them:
        const testAnimalSelectionHash = "test-animal-hash";
        const testTokenHash = "test-token-hash";
        const timestamp = new Date().toISOString();

        // Example data shape aligned with your schema
        const userData = {
            token: testTokenHash,
            animalSelection: testAnimalSelectionHash,
            email: null,            // acceptable since 'String?' in schema
            tokenBalance: 3000,
            loginAttempts: 0,
            status: 'ACTIVE',
            statusReason: 'Account created via test script',
            verificationToken: null,
            verificationTokenExpiry: null,
            lastIpAddress: '127.0.0.1',
            lastUserAgent: 'FakeUserAgent/1.0',
            statusHistory: [
                {
                    status: 'ACTIVE',
                    reason: 'Test script creation',
                    timestamp,
                },
            ],
            loginHistory: [
                {
                    action: 'ACCOUNT_CREATED',
                    ipAddress: '127.0.0.1',
                    userAgent: 'FakeUserAgent/1.0',
                    timestamp,
                },
            ],
            UserPreferences: {
                create: {
                    currentLanguage: 'en',
                    isSidebarPinned: true,
                    languageHistory: [
                        {
                            code: 'en',
                            name: 'English',
                            lastUsed: timestamp,
                            useCount: 1
                        }
                    ],
                    userAgentHistory: [
                        {
                            browser: 'ChromeTest',
                            os: 'Unknown',
                            device: 'Desktop',
                            timestamp
                        }
                    ]
                }
            }
        };

        console.log("Final prepared user data (test version):\n", JSON.stringify(userData, null, 2));

        // Attempt to create the user in the database
        const user = await prisma.user.create({
            data: userData,
            include: {
                UserPreferences: true
            }
        });

        console.log("User created successfully!");
        console.log("Result:\n", user);

    } catch (error) {
        console.error("Error creating user in test script:", error.message);
        // If you need the full error object:
        // console.error(error);
    } finally {
        // Always disconnect Prisma when script is done
        await prisma.$disconnect();
    }
}

main();
