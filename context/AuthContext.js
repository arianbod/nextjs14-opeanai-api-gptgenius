// context/AuthContext.js
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

const SESSION_DURATION = 10 * 24 * 60 * 60 * 1000; // 10 days in milliseconds

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [tokenBalance, setTokenBalance] = useState(10);
    const router = useRouter();

    const login = async (token, animalSelection) => {
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, animalSelection }),
            });

            if (response.ok) {
                const userData = await response.json();
                const timestamp = new Date().getTime();
                const userWithTimestamp = { ...userData, timestamp };
                setUser(userWithTimestamp);
                setTokenBalance(userData.tokenBalance);
                localStorage.setItem("user", JSON.stringify(userWithTimestamp));
                document.cookie = `user=${JSON.stringify(userWithTimestamp)}; path=/;`;
                return { success: true };
            } else {
                const error = await response.json();
                return { success: false, error: error.error };
            }
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, error: "An error occurred during login" };
        }
    };

    const logout = () => {
        setUser(null);
        setTokenBalance(0);
        localStorage.removeItem("user");
        document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        router.push("/");
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            const currentTime = new Date().getTime();
            if (currentTime - parsedUser.timestamp < SESSION_DURATION) {
                setUser(parsedUser);
                setTokenBalance(parsedUser.tokenBalance);
            } else {
                // Session expired
                logout();
            }
        }
    }, []);

    const values = { user, tokenBalance, setTokenBalance, login, logout, setUser };
    return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
