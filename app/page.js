"use client"
// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { nanoid } from 'nanoid';
// import ModelSelection from '@/components/chat/ModelSelection';
// import MessageInput from '@/components/chat/MessageInput';
// import { SiOpenai } from 'react-icons/si';

// const ChatPage = () => {
//     const router = useRouter();
//     const [selectedModel, setSelectedModel] = useState({
//         key: 'CHATGPT',
//         name: 'ChatGPT',
//         role: 'AI Assistant',
//         icon: SiOpenai,
//         color: 'from-green-400 to-blue-500',
//     });
//     const [inputText, setInputText] = useState('');

//     const createNewChat = (model, initialMessage = null) => {
//         const chatId = nanoid();
//         const chatHistory = [{
//             id: nanoid(),
//             role: 'system',
//             content: `You are ${model.name}, a ${model.role}.`,
//             timestamp: new Date().toISOString(),
//         }];

//         if (initialMessage) {
//             chatHistory.push({
//                 id: nanoid(),
//                 role: 'user',
//                 content: initialMessage,
//                 timestamp: new Date().toISOString(),
//             });
//         }

//         localStorage.setItem(chatId, JSON.stringify({
//             model: model,
//             messages: chatHistory,
//         }));

//         router.push(`/chat/${chatId}`);
//     };

//     const handleModelSelect = (model) => {
//         setSelectedModel(model);
//         createNewChat(model);
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         if (!inputText.trim() || !selectedModel) return;
//         createNewChat(selectedModel, inputText);
//     };

//     return (
//         <div className="flex flex-col h-screen w-full">
//             <div className="flex-grow overflow-auto">
//                 <ModelSelection onSelect={handleModelSelect} selectedModel={selectedModel} />
//             </div>
//                 <MessageInput
//                     inputText={inputText}
//                     setInputText={setInputText}
//                     handleSubmit={handleSubmit}
//                     isPending={false}
//                     isDisabled={!selectedModel}
//                 />
//         </div>
//     );
// };

// export default ChatPage;
// pages/index.js
// pages/index.js// pages/index.js
import React, { useState, useEffect } from 'react';
import AuthPage from '../components/auth/AuthPage';
import EnhancedChat from '../components/chat/EnhancedChat';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const Home = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const handleAuthenticated = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        document.cookie = `user=${JSON.stringify(userData)}; path=/;`;
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/');
    };

    const copyToken = () => {
        navigator.clipboard.writeText(user.token);
        toast.success('Token copied to clipboard!');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <header className="bg-blue-500 p-4 text-white">
                {/* <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">babaGPT</h1>
                     {user && (
                        <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded">
                            Logout
                        </button>
                    )} 
                </div> */}
            </header>
            <main className="container mx-auto mt-8">
                {user ? (
                    <div>
                        <div className="mb-4 p-4 bg-gray-100 rounded">
                            <h2 className="text-lg font-semibold mb-2">Your Token:</h2>
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    value={user.token}
                                    readOnly
                                    className="flex-grow p-2 border rounded-l"
                                />
                                <button
                                    onClick={copyToken}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-r"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                        <EnhancedChat userId={user.userId} />
                    </div>
                ) : (
                    <AuthPage onAuthenticated={handleAuthenticated} />
                )}
            </main>
        </div>
    );
};

export default Home;