import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { AIPersonas } from '@/lib/Personas';
import axios from 'axios';

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
        avatar: '',
        provider: "",
        modelCodeName: ""
    });
    const [messages, setMessages] = useState([]);
    const [chatList, setChatList] = useState([]);
    const router = useRouter();

    // New state for search functionality
    const [searchTerm, setSearchTerm] = useState('');
    const [searchFilter, setSearchFilter] = useState('all');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

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
            avatar: selectedModel.avatar,
            provider: selectedModel.provider,
            modelCodeName: selectedModel.modelCodeName,
        });
        router.push('/chat');
    };

    const fetchChatData = useCallback(
        async (chatId) => {
            if (!chatId || !user) return;
            try {
                setIsLoading(true);

                // Separate try-catch for chat info
                try {
                    const { data: chatInfo } = await axios.post('/api/chat/getChatInfo', {
                        userId: user.userId,
                        chatId
                    });

                    if (chatInfo) {
                        setActiveChat(prev => ({
                            ...prev,
                            id: chatInfo.id,
                            provider: chatInfo.provider,
                            model: chatInfo.model,
                            modelCodeName: chatInfo.modelCodeName
                        }));
                    }
                } catch (error) {
                    console.error('Error fetching chat info:', error);
                    toast.error('Failed to load chat information');
                }
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
                    const selectedModel = AIPersonas.find((p) => p.name === initialMessage) || AIPersonas[0];
                    setActiveChat({
                        id: chatId,
                        title: '',
                        model: selectedModel,
                        engine: selectedModel.engine,
                        role: selectedModel.role,
                        name: selectedModel.name,
                        avatar: selectedModel.avatar,
                        provider: selectedModel.provider,
                        modelCodeName: selectedModel.modelCodeName,
                    });
                    setModel(selectedModel);
                    setMessages(fetchedMessages);
                } else {
                    setActiveChat({
                        id: chatId,
                        title: '',
                        model: null,
                        engine: '',
                        role: '',
                        name: '', avatar: "", provider: "", modelCodeName: "",
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
        [user]
    );

    const resetChat = () => {
        setActiveChat({
            id: null,
            title: '',
            model: null,
            engine: '',
            role: '',
            name: '',
            avatar: "",
            provider: "",
            modelCodeName: "",
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

    // Function to toggle search
    const toggleSearch = () => setIsSearchOpen(prev => !prev);

    // Function to filter messages based on search term and filter
    const filteredMessages = useCallback(() => {
        return messages.filter(message => {
            const matchesSearch = message.content.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = searchFilter === 'all' || message.role === searchFilter;
            return matchesSearch && matchesFilter;
        });
    }, [messages, searchTerm, searchFilter]);

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
        resetChat,
        searchTerm,
        setSearchTerm,
        searchFilter,
        setSearchFilter,
        isSearchOpen,
        toggleSearch,
        filteredMessages,
    };

    return <ChatContext.Provider value={values}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);