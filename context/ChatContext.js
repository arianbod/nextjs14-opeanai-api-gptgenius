import { createChat } from "@/server/chat";
import { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { user } = useAuth()
    const [model, setModel] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeChat, setActiveChat] = useState({
        id: null,
        title: '',
        model: null,
        engine: '',
        role: '',
        name: ''
    });
    const [messages, setMessages] = useState([]);
    const [chatList, setChatList] = useState([]);
    const router = useRouter()

    const handleModelSelect = async (selectedModel) => {
        setModel(selectedModel);

        if (!user || !user.userId) {
            toast.error('Please log in to create a new chat.');
            return;
        }

        try {
            setIsLoading(true);
            const chatTitle = 'New Chat';
            const newChat = await createChat(user.userId, chatTitle);

            if (!newChat || !newChat.id) {
                throw new Error(
                    'Failed to create new chat: Invalid response from server'
                );
            }

            setActiveChat({
                id: newChat.id,
                title: chatTitle,
                model: selectedModel,
                engine: selectedModel.engine,
                role: selectedModel.role,
                name: selectedModel.name,
            });

            setMessages([]);
            router.push(`/chat/${newChat.id}`);
        } catch (error) {
            console.error('Error creating new chat:', error);
            toast.error(`Failed to create a new chat: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const addMessage = useCallback((newMessage) => {
        setMessages(prevMessages => [...prevMessages, newMessage]);
    }, []);

    const updateMessage = useCallback((messageId, newContent) => {
        setMessages(prevMessages =>
            prevMessages.map(msg =>
                msg.id === messageId ? { ...msg, content: newContent } : msg
            )
        );
    }, []);

    const removeMessage = useCallback((messageId) => {
        setMessages(prevMessages =>
            prevMessages.filter(msg => msg.id !== messageId)
        );
    }, []);

    const values = {
        model,
        setModel,
        activeChat,
        setActiveChat,
        handleModelSelect,
        messages,
        setMessages,
        addMessage,
        updateMessage,
        removeMessage,
        chatList,
        setChatList,
        isLoading
    };

    return (
        <ChatContext.Provider value={values}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);