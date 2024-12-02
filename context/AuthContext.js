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
            return false;
        }
    };

    const handleRouting = () => {
        const currentPath = window.location.pathname;
        const lang = currentPath.split('/')[1]; // Get language from URL

        // If we're on home or auth page and user is authenticated, redirect to chat
        if ((currentPath === `/${lang}` || currentPath === `/${lang}/auth`) && user) {
            router.push(`/${lang}/chat`);
        }
        // If we're on chat page and user is not authenticated, redirect to auth
        else if (currentPath.includes('/chat') && !user) {
            router.push(`/${lang}/auth`);
        }
    };

    const setCookieAndStorage = (userData) => {
        const timestamp = new Date().getTime();
        const userWithTimestamp = { ...userData, timestamp };

        // Set local storage
        localStorage.setItem("user", JSON.stringify(userWithTimestamp));

        // Set cookie with expiration
        const expires = new Date(timestamp + SESSION_DURATION).toUTCString();
        document.cookie = `user=${JSON.stringify(userWithTimestamp)}; path=/; expires=${expires}`;

        setUser(userWithTimestamp);
        setTokenBalance(userData.tokenBalance);

        // Get language from current URL and redirect to chat
        const lang = window.location.pathname.split('/')[1];
        router.push(`/${lang}/chat`);
    };

    const register = async (email, animalSelection) => {
        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, animalSelection }),
            });

            if (response.ok) {
                const userData = await response.json();
                setCookieAndStorage(userData);
                toast.success("Registration successful!");
                return { success: true };
            } else {
                const error = await response.json();
                toast.error(error.error || "Registration failed");
                return { success: false, error: error.error };
            }
        } catch (error) {
            toast.error("An error occurred during registration");
            return { success: false, error: "Registration error" };
        }
    };

    const login = async (token, animalSelection) => {
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, animalSelection }),
            });

            if (response.ok) {
                const userData = await response.json();
                setCookieAndStorage(userData);
                toast.success("Login successful!");
                return { success: true };
            } else {
                const error = await response.json();
                toast.error(error.error || "Login failed");
                return { success: false, error: error.error };
            }
        } catch (error) {
            toast.error("An error occurred during login");
            return { success: false, error: "Login error" };
        }
    };

    const logout = () => {
        setUser(null);
        setTokenBalance(0);
        localStorage.removeItem("user");
        document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        const lang = window.location.pathname.split('/')[1];
        router.push(`/${lang}`);
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

    // Handle routing whenever user state changes
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