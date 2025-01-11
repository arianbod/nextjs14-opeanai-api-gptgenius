// PreferencesContext.jsx
'use client';

import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import * as preferenceActions from '@/server/preferences';
import debounce from 'lodash/debounce';

// 1. Create Context with default values
const PreferencesContext = createContext({
	preferences: null,
	loading: true,
	error: null,
	isPinned: true,
	isHovered: false,
	showSidebar: true,
	setLanguage: async () => { },
	setSidebarPinned: async () => { },
	recordUserAgent: async () => { },
	reloadPreferences: async () => { },
	setIsHovered: () => { },
});

// 2. Export custom hook to consume
export const usePreferences = () => useContext(PreferencesContext);

// 3. Provider component
export function PreferencesProvider({ children }) {
	const { user } = useAuth();

	// Local state
	const [preferences, setPreferences] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [initialized, setInitialized] = useState(false);
	const [isPinned, setIsPinned] = useState(true);
	const [isHovered, setIsHovered] = useState(false);
	const [isMobile, setIsMobile] = useState(false)
	// Show sidebar if pinned OR hovered
	const showSidebar = isPinned || isHovered;

	/**
	 * Debounced Save
	 * We collect preference changes and save them after 1s of inactivity
	 * to reduce the number of server calls.
	 */
	const debouncedSave = useCallback(
		debounce(async (newPrefs) => {
			try {
				await preferenceActions.saveUserPreferences(user?.userId, newPrefs);
			} catch (err) {
				console.error('Error saving preferences:', err);
			}
		}, 1000),
		[user?.userId]
	);

	/**
	 * Load Preferences
	 * - Fetch from server
	 * - On failure, fallback to localStorage cache if available
	 */
	const loadPreferences = useCallback(async () => {
		if (!user?.userId) {
			// No logged-in user → no preferences to load
			setPreferences(null);
			setLoading(false);
			setError(null);
			return;
		}

		try {
			setLoading(true);

			// Get from server
			const prefs = await preferenceActions.getUserPreferences(user.userId);

			// Validate format
			if (!prefs || typeof prefs !== 'object') {
				throw new Error('Invalid preferences format received');
			}

			setPreferences(prefs);
			setIsPinned(prefs.isSidebarPinned ?? true);
			setError(null);

			// Cache them in localStorage for faster initial load next time
			localStorage.setItem(`preferences_${user.userId}`, JSON.stringify(prefs));
		} catch (err) {
			console.error('Error loading preferences:', err);
			setError(
				err instanceof Error ? err : new Error('Failed to load preferences')
			);

			// Fallback to cached prefs
			const cachedPrefs = localStorage.getItem(`preferences_${user.userId}`);
			if (cachedPrefs) {
				try {
					const parsed = JSON.parse(cachedPrefs);
					setPreferences(parsed);
					setIsPinned(parsed.isSidebarPinned ?? true);
				} catch (e) {
					console.error('Error parsing cached preferences:', e);
				}
			}
		} finally {
			setLoading(false);
			setInitialized(true);
		}
	}, [user?.userId]);

	// Initialize on user change (only load once)
	useEffect(() => {
		if (user?.userId && !initialized) {
			loadPreferences();
		}
	}, [user?.userId, initialized, loadPreferences]);

	/**
	 * setLanguage
	 * (Optional: Show immediate local update, then sync with server in background)
	 */
	const setLanguage = async (code, name) => {
		if (!user?.userId) {
			console.warn('Attempted to set language without authenticated user');
			return;
		}

		try {
			// Optimistic local update
			setPreferences((prev) => {
				const next = {
					...prev,
					languageCode: code,
					languageName: name,
				};
				// Debounce saving to server
				debouncedSave(next);
				return next;
			});

			// Call server in background
			const updatedPrefs = await preferenceActions.updateLanguagePreference(
				user.userId,
				code,
				name
			);

			// Replace local prefs with server response
			setPreferences(updatedPrefs);
			setError(null);
		} catch (err) {
			console.error('Error updating language:', err);
			setError(
				err instanceof Error ? err : new Error('Failed to update language')
			);
			// (Optional) revert local state here if necessary
			throw err;
		}
	};

	/**
	 * setSidebarPinned
	 * - Optimistically update local state
	 * - Then try to persist to server
	 */
	const setSidebarPinned = async (isPinnedNew) => {
		// Immediately reflect in local UI
		setIsPinned(isPinnedNew);
		setPreferences((prev) => {
			const next = { ...prev, isSidebarPinned: isPinnedNew };
			debouncedSave(next);
			return next;
		});

		// If not logged in, no DB update needed
		if (!user?.userId) {
			console.warn('Attempted to set sidebar state without authenticated user');
			return;
		}

		try {
			// Update server in the background
			const updatedPrefs = await preferenceActions.updateSidebarPinned(
				user.userId,
				isPinnedNew
			);

			// Replace local state with server response (if you want the “authoritative” result)
			setPreferences(updatedPrefs);
			setError(null);
		} catch (err) {
			console.error('Error updating sidebar state:', err);
			setError(
				err instanceof Error
					? err
					: new Error('Failed to update sidebar state')
			);
			// (Optional) revert UI:
			// setIsPinned(!isPinnedNew);
			// setPreferences((prev) => ({ ...prev, isSidebarPinned: !isPinnedNew }));
		}
	};

	/**
	 * recordUserAgent
	 */
	const recordUserAgent = async () => {
		if (!user?.userId) {
			console.warn('Attempted to record user agent without authenticated user');
			return;
		}

		// (Optional) Could do an optimistic update

		try {
			const updatedPrefs = await preferenceActions.recordUserAgent(
				user.userId,
				navigator.userAgent
			);

			setPreferences(updatedPrefs);
			debouncedSave(updatedPrefs);
			setError(null);
		} catch (err) {
			console.error('Error recording user agent:', err);
			setError(
				err instanceof Error
					? err
					: new Error('Failed to record user agent')
			);
			throw err;
		}
	};

	// Cleanup the debouncedSave on unmount
	useEffect(() => {
		return () => {
			debouncedSave.cancel();
		};
	}, [debouncedSave]);


	useEffect
		(() => {
			// Initial check
			const checkIsMobile = () => { setIsMobile(window.innerWidth < 768); };
			// Check on mount
			checkIsMobile();


			// Add event listener for resize

			window
				.addEventListener('resize', checkIsMobile);
			// Cleanup
			return () => { window.removeEventListener('resize', checkIsMobile); };
		}, []);
	// Empty dependency array since we only want to set this up once


	return (
		<PreferencesContext.Provider
			value={{
				preferences,
				loading,
				error,
				isPinned,
				isHovered,
				showSidebar,
				setLanguage,
				setSidebarPinned,
				recordUserAgent,
				reloadPreferences: loadPreferences,
				setIsHovered,
				isMobile
			}}
		>
			{children}
		</PreferencesContext.Provider>
	);
}
