import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { AIPersonas } from '@/lib/Personas';
import { getProviderConfig } from '@/lib/ai-providers';
import axios from 'axios';
import { nanoid } from 'nanoid';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const router = useRouter();

    // Core states
    const [model, setModel] = useState(null);
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

    // UI states
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchFilter, setSearchFilter] = useState('all');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const fetchChats = useCallback(async () => {
        if (!user?.userId) return;

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
    }, [user?.userId]);

    const handleModelSelect = useCallback((selectedModel) => {
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
        setMessages([]);
        router.push('/chat');
    }, [router]);

    const fetchChatData = useCallback(async (chatId) => {
        if (!chatId || !user?.userId) return;

        try {
            setIsLoading(true);
            const { data } = await axios.post('/api/chat/getChatInfo',
                { userId: user.userId, chatId },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (!data?.chatDataInfo?.modelCodeName) {
                throw new Error('Invalid chat info received');
            }

            const selectedModel = AIPersonas.find(
                p => p.modelCodeName === data.chatDataInfo.modelCodeName
            ) || AIPersonas.find(p => p.provider === data.chatDataInfo.provider);

            if (!selectedModel) {
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
                    modelCodeName: selectedModel.modelCodeName
                });
                setModel(selectedModel);
            }

            const messagesResponse = await fetch('/api/chat/getChatMessages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.userId, chatId }),
            });

            if (!messagesResponse.ok) {
                throw new Error('Failed to fetch chat messages');
            }

            const messagesData = await messagesResponse.json();
            setMessages(messagesData.messages || []);
        } catch (error) {
            console.error('Error fetching chat data:', error);
            toast.error('Failed to load chat data. Please try again.');
            resetChat();
        } finally {
            setIsLoading(false);
        }
    }, [user?.userId]);

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

    const addMessage = useCallback((newMessage) => {
        if (!newMessage) {
            console.error('Missing message');
            return;
        }

        const messageToAdd = {
            id: newMessage.id || nanoid(),
            role: newMessage.role || 'user',
            content: newMessage.content || '',
            timestamp: newMessage.timestamp || new Date().toISOString()
        };

        setMessages(prev => [...prev, messageToAdd]);
        return messageToAdd;
    }, []);

    const updateMessage = useCallback((messageId, newContent) => {
        if (!messageId) return;

        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, content: newContent || '' } : msg
        ));
    }, []);

    const removeMessage = useCallback((messageId) => {
        if (!messageId) return;
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
    }, []);

    const generateResponse = async (content) => {
        if (!content?.trim() || !user?.userId || isGenerating || !activeChat?.model) {
            toast.error('Please ensure all requirements are met before sending a message');
            return;
        }

        setIsGenerating(true);
        const userMessageId = nanoid();
        const assistantMessageId = nanoid();

        try {
            // Add user message first
            addMessage({
                id: userMessageId,
                role: 'user',
                content: content.trim(),
                timestamp: new Date().toISOString(),
            });

            // Add assistant placeholder
            addMessage({
                id: assistantMessageId,
                role: 'assistant',
                content: '',
                timestamp: new Date().toISOString(),
            });

            // Handle chat creation if needed
            let chatId = activeChat.id;
            if (!chatId) {
                const modelData = {
                    name: activeChat.model.name,
                    provider: activeChat.model.provider,
                    modelCodeName: activeChat.model.modelCodeName,
                    role: activeChat.model.role,
                };

                const response = await fetch('/api/chat/createChat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.userId,
                        initialMessage: content,
                        model: modelData,
                    }),
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to create chat');

                chatId = data.data.id;
                setActiveChat(prev => ({ ...prev, id: chatId }));
                window.history.pushState(null, '', `/chat/${chatId}`);
            }

            // Generate response
            const messageResponse = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.userId,
                    chatId,
                    content,
                    persona: activeChat.model,
                    provider: activeChat.provider,
                }),
            });

            if (!messageResponse.ok) throw new Error('Failed to send message');

            // Handle streaming response
            const reader = messageResponse.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = '';

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));

                                if (
                                    data.content &&
                                    typeof data.content === 'string' &&
                                    !data.content.includes('streaming_started') &&
                                    !data.content.includes('streaming_completed') &&
                                    !data.content.includes('stream_ended')
                                ) {
                                    accumulatedContent += data.content;
                                    updateMessage(assistantMessageId, accumulatedContent);
                                }
                            } catch (error) {
                                console.error('Error parsing SSE data:', error);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Stream reading error:', error);
                throw new Error('Failed to read response stream');
            }

            await fetchChats();
        } catch (error) {
            console.error('Error generating response:', error);
            removeMessage(assistantMessageId);
            removeMessage(userMessageId);
            toast.error(`Failed to generate response: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleSearch = useCallback(() =>
        setIsSearchOpen(prev => !prev),
        []);

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
    }, [user?.userId, fetchChats]);

    useEffect(() => {
        const chatId = window.location.pathname.split('/').pop();
        if (chatId && chatId !== 'chat' && user?.userId && !activeChat.id) {
            setActiveChat(prev => ({ ...prev, id: chatId }));
        }
    }, [user?.userId]);

    useEffect(() => {
        if (activeChat?.id && user?.userId && messages.length === 0) {
            fetchChatData(activeChat.id);
        }
    }, [activeChat?.id, user?.userId, messages.length, fetchChatData]);

    const values = {
        model,
        setModel,
        activeChat,
        setActiveChat,
        messages,
        chatList,
        isLoading,
        isGenerating,
        searchTerm,
        setSearchTerm,
        searchFilter,
        setSearchFilter,
        isSearchOpen,
        handleModelSelect,
        addMessage,
        updateMessage,
        removeMessage,
        fetchChatData,
        resetChat,
        generateResponse,
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