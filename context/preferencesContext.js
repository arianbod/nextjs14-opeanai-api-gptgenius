'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as preferenceActions from '@/server/preferences';
import debounce from 'lodash/debounce';

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
	const [initialized, setInitialized] = useState(false);

	// Added debounced save function to prevent too many DB calls
	const debouncedSave = useCallback(
		debounce(async (newPrefs) => {
			try {
				await preferenceActions.saveUserPreferences(user?.id, newPrefs);
			} catch (err) {
				console.error('Error saving preferences:', err);
			}
		}, 1000),
		[user?.id]
	);

	// Enhanced loadPreferences with better error handling and state management
	const loadPreferences = useCallback(async () => {
		if (!user?.id) {
			setPreferences(null);
			setLoading(false);
			setError(null);
			return;
		}

		try {
			setLoading(true);
			const prefs = await preferenceActions.getUserPreferences(user.id);

			// Add client-side validation of preferences
			if (!prefs || typeof prefs !== 'object') {
				throw new Error('Invalid preferences format received');
			}

			setPreferences(prefs);
			setError(null);

			// Cache preferences in localStorage for faster initial loads
			localStorage.setItem(`preferences_${user.id}`, JSON.stringify(prefs));
		} catch (err) {
			console.error('Error loading preferences:', err);
			setError(err instanceof Error ? err : new Error('Failed to load preferences'));

			// Try to load from cache if server request fails
			const cachedPrefs = localStorage.getItem(`preferences_${user.id}`);
			if (cachedPrefs) {
				try {
					setPreferences(JSON.parse(cachedPrefs));
				} catch (e) {
					console.error('Error parsing cached preferences:', e);
				}
			}
		} finally {
			setLoading(false);
			setInitialized(true);
		}
	}, [user?.id]);

	// Initialize preferences when user changes
	useEffect(() => {
		if (user?.id && !initialized) {
			loadPreferences();
		}
	}, [user?.id, initialized, loadPreferences]);

	const setLanguage = async (code, name) => {
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
			debouncedSave(updatedPrefs);
			setError(null);
		} catch (err) {
			console.error('Error updating language:', err);
			setError(err instanceof Error ? err : new Error('Failed to update language'));
			throw err;
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
			debouncedSave(updatedPrefs);
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
			debouncedSave(updatedPrefs);
			setError(null);
		} catch (err) {
			console.error('Error recording user agent:', err);
			setError(err instanceof Error ? err : new Error('Failed to record user agent'));
			throw err;
		}
	};

	// Cleanup effect
	useEffect(() => {
		return () => {
			debouncedSave.cancel();
		};
	}, [debouncedSave]);

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