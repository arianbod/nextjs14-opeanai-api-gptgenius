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

            // Set local storage and cookie
            localStorage.setItem("user", JSON.stringify(userDataToStore));
            const expires = new Date(timestamp + SESSION_DURATION).toUTCString();
            document.cookie = `user=${encodeURIComponent(JSON.stringify(userDataToStore))}; path=/; expires=${expires}; SameSite=Lax`;

            // Update state
            setUser(userDataToStore);
            setTokenBalance(userData.tokenBalance);

            const lang = window.location.pathname.split('/')[1] || 'en';
            try {
                const response = await fetch('/api/chat/getChatList', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: userData.userId }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const isNewUser = !data.chats?.length;
                    return { success: true, isNewUser, lang };
                }
            } catch (error) {
                console.error('Error checking chat list:', error);
                return { success: true, isNewUser: false, lang };
            }

            return { success: true, isNewUser: false, lang };
        } catch (error) {
            console.error("Error setting auth data:", error);
            return { success: false, error: "Failed to store authentication data" };
        }
    };

    const register = async (email, animalSelection) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

            // On success
            if (data.success) {
                const result = await setCookieAndStorage({
                    userId: data.userId,
                    token: data.token,
                    tokenBalance: data.tokenBalance,
                    animalSelection
                });

                if (!result.success) {
                    return {
                        success: false,
                        error: "Failed to store authentication data"
                    };
                }

                // Return isNewUser and lang so AuthPage can handle routing after confirmation
                return { ...data, isNewUser: result.isNewUser, lang: result.lang };
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
                const result = await setCookieAndStorage({
                    userId: data.userId,
                    token: data.token,
                    tokenBalance: data.tokenBalance,
                    animalSelection
                });

                if (!result.success) {
                    return {
                        success: false,
                        error: "Failed to store authentication data"
                    };
                }

                return {
                    success: true,
                    token: data.token,
                    message: data.message,
                    isNewUser: result.isNewUser,
                    lang: result.lang
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
            setUser(null);
            setTokenBalance(0);

            localStorage.clear();
            sessionStorage.clear();

            document.cookie.split(";").forEach(cookie => {
                document.cookie = cookie
                    .replace(/^ +/, "")
                    .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
            });
            document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

            const lang = window.location.pathname.split('/')[1] || 'en';
            toast.success('Successfully logged out');
            router.refresh();
            router.push(`/${lang}`);
            window.location.reload();

        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Error during logout');
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

    // Removed handleRouting() in useEffect to avoid unwanted redirects
    // We'll rely on AuthPage to handle final redirect after confirmation
    // useEffect(() => {
    //     handleRouting();
    // }, [user]);

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
