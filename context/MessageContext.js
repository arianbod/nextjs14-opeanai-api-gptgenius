// MessageContext.js
import React, { createContext, useContext, useState } from 'react';

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);

    const addMessage = (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    const updateMessage = (id, updatedContent) => {
        setMessages((prevMessages) =>
            prevMessages.map((msg) =>
                msg.id === id ? { ...msg, content: updatedContent } : msg
            )
        );
    };

    const removeMessage = (id) => {
        setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));
    };

    return (
        <MessageContext.Provider value={{ messages, addMessage, updateMessage, removeMessage }}>
            {children}
        </MessageContext.Provider>
    );
};

// Add this line to export the useMessages hook
export const useMessages = () => useContext(MessageContext);