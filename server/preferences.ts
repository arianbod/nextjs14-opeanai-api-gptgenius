'use server';

import prisma from '@/prisma/db';
import { getUserById } from './auth';

interface LanguageEntry {
	code: string;
	name: string;
	lastUsed: string;
	useCount: number;
}

interface UserAgentEntry {
	browser: string;
	os: string;
	device: string;
	timestamp: string;
}

export async function initializeUserPreferences(userId: string) {
	const user = await getUserById(userId);
	if (!user) throw new Error('User not found');

	try {
		return await prisma.userPreferences.create({
			data: {
				userId: user.id,
				currentLanguage: 'en',
				isSidebarPinned: true,
				languageHistory: [
					{
						code: 'en',
						name: 'English',
						lastUsed: new Date().toISOString(),
						useCount: 1,
					},
				],
				userAgentHistory: [],
			},
		});
	} catch (error) {
		console.error('Error initializing user preferences:', error);
		throw error;
	}
}

export async function getUserPreferences(userId: string) {
	const user = await getUserById(userId);
	if (!user) throw new Error('User not found');

	try {
		let preferences = await prisma.userPreferences.findUnique({
			where: { userId: user.id },
		});

		if (!preferences) {
			preferences = await initializeUserPreferences(userId);
		}

		return preferences;
	} catch (error) {
		console.error('Error getting user preferences:', error);
		throw error;
	}
}

export async function updateLanguagePreference(
	userId: string,
	languageCode: string,
	languageName: string
) {
	const user = await getUserById(userId);
	if (!user) throw new Error('User not found');

	try {
		const preferences = await getUserPreferences(userId);
		const languageHistory = [
			...(preferences.languageHistory as LanguageEntry[]),
		];

		const existingIndex = languageHistory.findIndex(
			(l) => l.code === languageCode
		);
		if (existingIndex >= 0) {
			// Update existing language entry
			languageHistory[existingIndex] = {
				...languageHistory[existingIndex],
				lastUsed: new Date().toISOString(),
				useCount: languageHistory[existingIndex].useCount + 1,
			};
		} else {
			// Add new language entry
			languageHistory.push({
				code: languageCode,
				name: languageName,
				lastUsed: new Date().toISOString(),
				useCount: 1,
			});
		}

		return await prisma.userPreferences.update({
			where: { userId: user.id },
			data: {
				currentLanguage: languageCode,
				languageHistory: languageHistory,
				updatedAt: new Date(),
			},
		});
	} catch (error) {
		console.error('Error updating language preference:', error);
		throw error;
	}
}

export async function updateSidebarPinned(userId: string, isPinned: boolean) {
	const user = await getUserById(userId);
	if (!user) throw new Error('User not found');

	try {
		return await prisma.userPreferences.update({
			where: { userId: user.id },
			data: {
				isSidebarPinned: isPinned,
				updatedAt: new Date(),
			},
		});
	} catch (error) {
		console.error('Error updating sidebar pin state:', error);
		throw error;
	}
}

export async function recordUserAgent(userId: string, userAgent: string) {
	const user = await getUserById(userId);
	if (!user) throw new Error('User not found');

	try {
		const preferences = await getUserPreferences(userId);
		const userAgentHistory = [
			...(preferences.userAgentHistory as UserAgentEntry[]),
		];

		// Parse user agent string
		const ua = {
			browser:
				userAgent.match(
					/(?:firefox|opera|safari|chrome|msie|trident(?=\/))\/?\s*(\d+)/i
				)?.[1] || 'Unknown',
			os: navigator.platform || 'Unknown',
			device: /mobile|tablet|android/i.test(userAgent) ? 'Mobile' : 'Desktop',
			timestamp: new Date().toISOString(),
		};

		// Add new entry to history
		userAgentHistory.push(ua);

		// Keep only last 50 entries
		if (userAgentHistory.length > 50) {
			userAgentHistory.shift();
		}

		return await prisma.userPreferences.update({
			where: { userId: user.id },
			data: {
				userAgentHistory: userAgentHistory,
				updatedAt: new Date(),
			},
		});
	} catch (error) {
		console.error('Error recording user agent:', error);
		throw error;
	}
}
