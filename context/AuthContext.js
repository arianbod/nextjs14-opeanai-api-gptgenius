"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const AuthContext = createContext();

export const SESSION_DURATION = 10 * 24 * 60 * 60 * 1000; // 10 days in milliseconds

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [tokenBalance, setTokenBalance] = useState(10);
    const router = useRouter();

    const checkAuth = () => {
        try {
            const storedUser = localStorage.getItem("user");
            if (!storedUser) return false;

            const userData = JSON.parse(storedUser);
            const currentTime = new Date().getTime();

            if (currentTime - userData.timestamp >= SESSION_DURATION) {
                logout();
                return false;
            }

            return true;
        } catch (error) {
            console.error("Auth check error:", error);
            return false;
        }
    };

    const handleRouting = () => {
        const currentPath = window.location.pathname;
        const lang = currentPath.split('/')[1];

        if ((currentPath === `/${lang}` || currentPath === `/${lang}/auth`) && user) {
            router.push(`/${lang}/chat`);
        }
        else if (currentPath.includes('/chat') && !user) {
            router.push(`/${lang}/auth`);
        }
    };

    const setCookieAndStorage = async (userData) => {
        try {
            const timestamp = new Date().getTime();
            const userDataToStore = {
                userId: userData.userId,
                token: userData.token,
                tokenBalance: userData.tokenBalance,
                timestamp,
                animalSelection: userData.animalSelection
            };

            // Set local storage first
            localStorage.setItem("user", JSON.stringify(userDataToStore));

            // Set cookie with proper structure and expiration
            const expires = new Date(timestamp + SESSION_DURATION).toUTCString();
            document.cookie = `user=${encodeURIComponent(JSON.stringify(userDataToStore))}; path=/; expires=${expires}; SameSite=Lax`;

            // Update state
            setUser(userDataToStore);
            setTokenBalance(userData.tokenBalance);

            // Get language
            const lang = window.location.pathname.split('/')[1] || 'en';
            // from here
            // Check if user has any existing chats
            try {
                const response = await fetch('/api/chat/getChatList', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: userData.userId }),
                });

                if (response.ok) {
                    const data = await response.json();
                    // If new user (no chats), redirect to welcome page
                    if (!data.chats?.length) {
                        router.push(`/${lang}/welcome`);
                    } else {
                        // Existing user, redirect to chat
                        router.push(`/${lang}/chat`);
                    }
                }
            } catch (error) {
                console.error('Error checking chat list:', error);
                // Default to chat route if check fails
                router.push(`/${lang}/chat`);
            }
            // to here 
            return true;
        } catch (error) {
            console.error("Error setting auth data:", error);
            return false;
        }
    };

    const register = async (email, animalSelection) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, animalSelection }),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error,
                    details: data.details,
                    validationErrors: data.validationErrors,
                    code: data.code
                };
            }

            // If registration successful, immediately set the auth data
            if (data.success) {
                const stored = await setCookieAndStorage({
                    userId: data.userId,
                    token: data.token,
                    tokenBalance: data.tokenBalance,
                    animalSelection: animalSelection
                });

                if (!stored) {
                    return {
                        success: false,
                        error: "Failed to store authentication data"
                    };
                }
            }

            return data;
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: 'An unexpected error occurred',
                code: 'UNKNOWN_ERROR'
            };
        }
    };

    const login = async (token, animalSelection) => {
        if (!token?.trim()) {
            return {
                success: false,
                error: "Please enter your authentication token"
            };
        }

        if (!Array.isArray(animalSelection) || animalSelection.length !== 3) {
            return {
                success: false,
                error: "Please select exactly 3 animals in order"
            };
        }

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, animalSelection }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const stored = await setCookieAndStorage({
                    userId: data.userId,
                    token: data.token,
                    tokenBalance: data.tokenBalance,
                    animalSelection: animalSelection
                });

                if (!stored) {
                    return {
                        success: false,
                        error: "Failed to store authentication data"
                    };
                }

                return {
                    success: true,
                    token: data.token,
                    message: data.message
                };
            } else {
                let errorMessage = data.error;
                if (data.remainingAttempts) {
                    errorMessage = `${data.error} (${data.remainingAttempts} attempts remaining)`;
                }
                if (data.remainingLockoutTime) {
                    errorMessage = `${data.error} Try again in ${data.remainingLockoutTime} minutes.`;
                }

                return {
                    success: false,
                    error: errorMessage,
                    isLocked: data.isLocked,
                    remainingAttempts: data.remainingAttempts,
                    remainingLockoutTime: data.remainingLockoutTime
                };
            }
        } catch (error) {
            console.error("Login error:", error);
            return {
                success: false,
                error: "An unexpected error occurred during login. Please try again."
            };
        }
    };

    const logout = async () => {
        try {
            // 1. Clear all states
            setUser(null);
            setTokenBalance(0);

            // 2. Clear all storage
            localStorage.clear();
            sessionStorage.clear();

            // 3. Clear all cookies
            document.cookie.split(";").forEach(cookie => {
                document.cookie = cookie
                    .replace(/^ +/, "")
                    .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
            });
            document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            // 4. Get current language from path
            const lang = window.location.pathname.split('/')[1] || 'en';

            // 5. Clear server-side session
            // try {
            //     await fetch('/api/auth/logout', {
            //         method: 'POST',
            //         credentials: 'include'
            //     });
            // } catch (error) {
            //     console.error('Server logout error:', error);
            // }

            // 6. Show success message
            toast.success('Successfully logged out');

            // 7. Navigate using Next.js router with refresh
            router.refresh(); // Refresh server components
            router.push(`/${lang}`); // Replace current route with home
            window.location.reload();

        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Error during logout');

            // Fallback using Next.js router
            router.refresh();
            router.replace(`/`);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (!checkAuth()) {
                    logout();
                    return;
                }
                setUser(parsedUser);
                setTokenBalance(parsedUser.tokenBalance);
            } catch (error) {
                console.error("Error parsing stored user:", error);
                logout();
            }
        }
    }, []);

    useEffect(() => {
        handleRouting();
    }, [user]);

    const value = {
        user,
        tokenBalance,
        setTokenBalance,
        login,
        register,
        logout,
        setUser,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};