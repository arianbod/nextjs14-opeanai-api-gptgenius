// context/ChatContext.js
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { AIPersonas } from '@/lib/Personas';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [model, setModel] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeChat, setActiveChat] = useState({
        id: null,
        title: '',
        model: null,
        engine: '',
        role: '',
        name: '',
    });
    const [messages, setMessages] = useState([]);
    const [chatList, setChatList] = useState([]);
    const router = useRouter();

    const fetchChats = async () => {
        if (user?.userId) {
            try {
                const response = await fetch('/api/chat/getChatList', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.userId }),
                });
                if (response.ok) {
                    const data = await response.json();
                    setChatList(data.chats);
                } else {
                    console.error('Failed to fetch chat list');
                }
            } catch (error) {
                console.error('Error fetching chat list:', error);
            }
        }
    };




    const handleModelSelect = (selectedModel) => {
        setModel(selectedModel);

        setActiveChat({
            id: null,
            title: '',
            model: selectedModel,
            engine: selectedModel.engine,
            role: selectedModel.role,
            name: selectedModel.name,
        });

        // Navigate to the chat interface without a chatId
        router.push('/chat');
    };

    const fetchChatData = useCallback(
        async (chatId) => {
            if (!chatId || !user) return;

            try {
                setIsLoading(true);

                // Fetch messages from the API endpoint
                const response = await fetch('/api/chat/getChatMessages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.userId, chatId }),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch chat messages');
                }

                const data = await response.json();
                const fetchedMessages = data.messages;

                if (fetchedMessages.length > 0) {
                    const initialMessage = fetchedMessages[0].content.split(',')[0].trim();
                    const selectedModel =
                        AIPersonas.find((p) => p.name === initialMessage) || AIPersonas[0];
                    setActiveChat({
                        id: chatId,
                        title: '',
                        model: selectedModel,
                        engine: selectedModel.engine,
                        role: selectedModel.role,
                        name: selectedModel.name,
                    });
                    setModel(selectedModel);
                    setMessages(fetchedMessages);
                } else {
                    // If no messages, treat as a new chat
                    setActiveChat({
                        id: chatId,
                        title: '',
                        model: null,
                        engine: '',
                        role: '',
                        name: '',
                    });
                    setMessages([]);
                }
            } catch (error) {
                console.error('Error fetching chat data:', error);
                toast.error('Failed to load chat data. Please try again.');
                setMessages([]);
            } finally {
                setIsLoading(false);
            }
        },
        [user, setActiveChat, setModel, setMessages]
    );

    const resetChat = () => {
        setActiveChat({
            id: null,
            title: '',
            model: null,
            engine: '',
            role: '',
            name: '',
        });
        setMessages([]);
    };

    const addMessage = useCallback((newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
    }, []);

    const updateMessage = useCallback((messageId, newContent) => {
        setMessages((prevMessages) =>
            prevMessages.map((msg) => (msg.id === messageId ? { ...msg, content: newContent } : msg))
        );
    }, []);

    const removeMessage = useCallback((messageId) => {
        setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageId));
    }, []);
    useEffect(() => {
        fetchChats();
    }, [user, activeChat]);

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
        isLoading,
        fetchChatData,
        resetChat, // Added resetChat to the context values
    };

    return <ChatContext.Provider value={values}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);
