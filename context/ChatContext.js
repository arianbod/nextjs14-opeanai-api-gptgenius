import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { AIPersonas } from '@/lib/Personas';
import { getProviderConfig } from '@/lib/ai-providers';
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

    // Search functionality states
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
                    setChatList(data.chats || []);
                } else {
                    console.error('Failed to fetch chat list');
                    toast.error('Failed to load chat list');
                }
            } catch (error) {
                console.error('Error fetching chat list:', error);
                toast.error('Failed to load chat list');
            }
        }
    };

    const handleModelSelect = (selectedModel) => {
        if (!selectedModel) {
            console.error('No model selected');
            return;
        }

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

                // First get chat info
                try {
                    const { data } = await axios.post('/api/chat/getChatInfo',
                        { userId: user.userId, chatId },
                        { headers: { 'Content-Type': 'application/json' } }
                    );

                    if (data?.chatDataInfo?.modelCodeName) {
                        const selectedModel = AIPersonas.find(
                            (p) => p.modelCodeName === data.chatDataInfo.modelCodeName
                        ) || AIPersonas.find((p) => p.provider === data.chatDataInfo.provider);

                        if (!selectedModel) {
                            console.warn(`Model ${data.chatDataInfo.modelCodeName} not found, using default model for provider ${data.chatDataInfo.provider}`);
                            const defaultModel = AIPersonas.find(p =>
                                p.provider === data.chatDataInfo.provider &&
                                p.modelCodeName === getProviderConfig(data.chatDataInfo.provider).defaultModel
                            );

                            if (!defaultModel) {
                                throw new Error('No compatible model found');
                            }

                            setActiveChat({
                                id: data.chatDataInfo.id,
                                title: data.chatDataInfo.title || '',
                                model: defaultModel,
                                engine: defaultModel.engine,
                                role: defaultModel.role,
                                name: defaultModel.name,
                                avatar: defaultModel.avatar,
                                provider: data.chatDataInfo.provider,
                                modelCodeName: defaultModel.modelCodeName
                            });
                            setModel(defaultModel);
                        } else {
                            setActiveChat({
                                id: data.chatDataInfo.id,
                                title: data.chatDataInfo.title || '',
                                model: selectedModel,
                                engine: selectedModel.engine,
                                role: selectedModel.role,
                                name: selectedModel.name,
                                avatar: selectedModel.avatar,
                                provider: data.chatDataInfo.provider,
                                modelCodeName: data.chatDataInfo.modelCodeName
                            });
                            setModel(selectedModel);
                        }
                    } else {
                        throw new Error('Invalid chat info received');
                    }
                } catch (error) {
                    console.error('Error fetching chat info:', error);
                    toast.error('Failed to load chat information');
                    return;
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
                if (data?.messages) {
                    setMessages(data.messages);
                } else {
                    setMessages([]);
                }

            } catch (error) {
                console.error('Error fetching chat data:', error);
                toast.error('Failed to load chat data. Please try again.');
                setMessages([]);
                resetChat();
            } finally {
                setIsLoading(false);
            }
        },
        [user]
    );

    const resetChat = useCallback(() => {
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
        setModel(null);
    }, []);

    // Key changes in these message handling functions
    const addMessage = useCallback((newMessage) => {
        // More permissive message validation
        if (typeof newMessage !== 'object') {
            console.error('Invalid message format:', newMessage);
            return;
        }

        const messageToAdd = {
            id: newMessage.id || '',
            role: newMessage.role || 'user',
            content: newMessage.content || '',
            timestamp: newMessage.timestamp || new Date().toISOString()
        };

        setMessages(prevMessages => [...prevMessages, messageToAdd]);
    }, []);

    const updateMessage = useCallback((messageId, newContent) => {
        if (!messageId) {
            console.error('Missing messageId for update');
            return;
        }

        setMessages(prevMessages =>
            prevMessages.map(msg => msg.id === messageId
                ? { ...msg, content: newContent || '' }
                : msg
            )
        );
    }, []);

    const removeMessage = useCallback((messageId) => {
        if (!messageId) {
            console.error('Missing messageId for removal');
            return;
        }
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
    }, []);

    const toggleSearch = () => setIsSearchOpen(prev => !prev);

    const filteredMessages = useCallback(() => {
        return messages.filter(message => {
            const matchesSearch = message.content.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = searchFilter === 'all' || message.role === searchFilter;
            return matchesSearch && matchesFilter;
        });
    }, [messages, searchTerm, searchFilter]);

    useEffect(() => {
        if (user?.userId) {
            fetchChats();
        }
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

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};