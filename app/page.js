// pages/index.js
"use client";
import React from "react";
import AuthPage from "../components/auth/AuthPage";
import EnhancedChat from "../components/chat/ChatPage";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { FaCopy } from "react-icons/fa";
import Loading from "@/components/Loading";

const Home = () => {
    const { user } = useAuth();

    const copyToken = () => {
        navigator.clipboard.writeText(user.token);
        toast.success("Token copied to clipboard!");
    };

    if (user === null) {
        return <AuthPage />;
    }

    return (
        <div>
            <main className="container mx-auto">
                <div>
                    <div className="mb-4 p-4  bg-blue-900 rounded text-white pt-8 mx-auto place-context-center flex flex-col">
                        <h2 className="text-lg font-semibold mb-2 text-center">
                            This is your one-time Token
                        </h2>
                        <div className="flex items-center">
                            <input
                                onClick={copyToken}
                                type="text"
                                value={user.token}
                                readOnly
                                className="cursor-pointer flex-grow h-8 px-2 border rounded-l bg-blue-500 animate-pulse font-bold text-center"
                            />
                            <button
                                onClick={copyToken}
                                className="bg-blue-500 text-white px-4 h-8 rounded-r"
                            >
                                <FaCopy />
                            </button>
                        </div>
                        <span className="text-sm text-center">
                            Keep in mind that after each login, your token will change. Please note your new token for future logins.
                        </span>
                    </div>
                    <EnhancedChat />
                </div>
            </main>
        </div>
    );
};

export default Home;
