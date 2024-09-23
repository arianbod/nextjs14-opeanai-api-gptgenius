"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import ModelSelection from '@/components/chat/ModelSelection';
import MessageInput from '@/components/chat/MessageInput';
import { SiOpenai } from 'react-icons/si';

const ChatPage = () => {
    const router = useRouter();
    const [selectedModel, setSelectedModel] = useState({
        key: 'CHATGPT',
        name: 'ChatGPT',
        role: 'AI Assistant',
        icon: SiOpenai,
        color: 'from-green-400 to-blue-500',
    });
    const [inputText, setInputText] = useState('');

    const createNewChat = (model, initialMessage = null) => {
        const chatId = nanoid();
        const chatHistory = [{
            id: nanoid(),
            role: 'system',
            content: `You are ${model.name}, a ${model.role}.`,
            timestamp: new Date().toISOString(),
        }];

        if (initialMessage) {
            chatHistory.push({
                id: nanoid(),
                role: 'user',
                content: initialMessage,
                timestamp: new Date().toISOString(),
            });
        }

        localStorage.setItem(chatId, JSON.stringify({
            model: model,
            messages: chatHistory,
        }));

        router.push(`/chat/${chatId}`);
    };

    const handleModelSelect = (model) => {
        setSelectedModel(model);
        createNewChat(model);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedModel) return;
        createNewChat(selectedModel, inputText);
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <div className="flex-grow overflow-auto p-4">
                <ModelSelection onSelect={handleModelSelect} selectedModel={selectedModel} />
            </div>
            <div className="p-4">
                <MessageInput
                    inputText={inputText}
                    setInputText={setInputText}
                    handleSubmit={handleSubmit}
                    isPending={false}
                    isDisabled={!selectedModel}
                />
            </div>
        </div>
    );
};

export default ChatPage;