'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import * as preferenceActions from '@/server/preferences';

const PreferencesContext = createContext({
	preferences: null,
	loading: true,
	error: null,
	setLanguage: async () => { },
	setSidebarPinned: async () => { },
	recordUserAgent: async () => { },
	reloadPreferences: async () => { },
});

export const usePreferences = () => useContext(PreferencesContext);

export function PreferencesProvider({ children }) {
	const { user } = useAuth();
	const [preferences, setPreferences] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const loadPreferences = async () => {
		// Reset states when no user is present
		if (!user?.id) {
			setPreferences(null);
			setLoading(false);
			setError(null);
			return;
		}

		try {
			setLoading(true);
			const prefs = await preferenceActions.getUserPreferences(user.id);
			setPreferences(prefs);
			setError(null);
		} catch (err) {
			console.error('Error loading preferences:', err);
			setError(err instanceof Error ? err : new Error('Failed to load preferences'));
		} finally {
			setLoading(false);
		}
	};

	// Load preferences when user changes
	useEffect(() => {
		loadPreferences();
	}, [user?.id]);

	const setLanguage = async (code, name) => {
		// Only proceed if we have a valid user ID
		if (!user?.id) {
			console.warn('Attempted to set language without authenticated user');
			return;
		}

		try {
			const updatedPrefs = await preferenceActions.updateLanguagePreference(
				user.id,
				code,
				name
			);
			setPreferences(updatedPrefs);
			setError(null);
		} catch (err) {
			console.error('Error updating language:', err);
			setError(err instanceof Error ? err : new Error('Failed to update language'));
			throw err; // Rethrow to allow handling in components
		}
	};

	const setSidebarPinned = async (isPinned) => {
		if (!user?.id) {
			console.warn('Attempted to set sidebar state without authenticated user');
			return;
		}

		try {
			const updatedPrefs = await preferenceActions.updateSidebarPinned(
				user.id,
				isPinned
			);
			setPreferences(updatedPrefs);
			setError(null);
		} catch (err) {
			console.error('Error updating sidebar state:', err);
			setError(err instanceof Error ? err : new Error('Failed to update sidebar state'));
			throw err;
		}
	};

	const recordUserAgent = async () => {
		if (!user?.id) {
			console.warn('Attempted to record user agent without authenticated user');
			return;
		}

		try {
			const updatedPrefs = await preferenceActions.recordUserAgent(
				user.id,
				navigator.userAgent
			);
			setPreferences(updatedPrefs);
			setError(null);
		} catch (err) {
			console.error('Error recording user agent:', err);
			setError(err instanceof Error ? err : new Error('Failed to record user agent'));
			throw err;
		}
	};

	return (
		<PreferencesContext.Provider
			value={{
				preferences,
				loading,
				error,
				setLanguage,
				setSidebarPinned,
				recordUserAgent,
				reloadPreferences: loadPreferences,
			}}
		>
			{children}
		</PreferencesContext.Provider>
	);
}