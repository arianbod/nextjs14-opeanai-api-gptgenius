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
import { FaCopy } from 'react-icons/fa6';

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



    const copyToken = () => {
        navigator.clipboard.writeText(user.token);
        toast.success('Token copied to clipboard!');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {/* <header className="bg-blue-500 p-4 text-white">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">babaGPT</h1>
                     {user && (
                        <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded">
                            Logout
                        </button>
                    )} 
                </div> 
            </header> */}
            <main className="container mx-auto">
                {user ? (
                    <div>
                        <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900 rounded text-white pt-8">
                            <h2 className="text-lg font-semibold mb-2">This is your one time Token:</h2>
                            <div className="flex items-center">
                                <input onClick={copyToken}
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
                            <span className='text-sm'>keep in mind after each login it will change and you need to take the new one.</span>
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