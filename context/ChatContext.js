import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { AIPersonas } from '@/lib/Personas';
import { getProviderConfig } from '@/lib/ai-providers';
import { nanoid } from 'nanoid';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const params = useParams();
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
        modelCodeName: "",
        modelAllowed: {}
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
            modelAllowed: selectedModel.allowed
        });
        setMessages([]);
        router.prefetch('/chat');
    }, [router]);

    const fetchChatData = useCallback(async (chatId) => {
        if (!chatId || !user?.userId) return;

        try {
            setIsLoading(true);
            const response = await fetch('/api/chat/getChatInfo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.userId, chatId })
            });

            const { chatDataInfo } = await response.json();
            console.log("chatDataInfo is:", chatDataInfo)
            if (!chatDataInfo?.modelCodeName) {
                throw new Error('Invalid chat info received');
            }

            const selectedModel = AIPersonas.find(
                p => p.modelCodeName === chatDataInfo.modelCodeName
            ) || AIPersonas.find(p => p.provider === chatDataInfo.provider);
            console.log("selected model:", selectedModel)
            if (!selectedModel) {
                const defaultModel = AIPersonas.find(p =>
                    p.provider === chatDataInfo.provider &&
                    p.modelCodeName === getProviderConfig(chatDataInfo.provider).defaultModel
                );

                if (!defaultModel) {
                    throw new Error('No compatible model found');
                }

                setActiveChat({
                    id: chatDataInfo.id,
                    title: chatDataInfo.title || '',
                    model: defaultModel,
                    engine: defaultModel.engine,
                    role: defaultModel.role,
                    name: defaultModel.name,
                    avatar: defaultModel.avatar,
                    provider: chatDataInfo.provider,
                    modelCodeName: defaultModel.modelCodeName,
                    modelAllowed: defaultModel.allowed
                });
                setModel(defaultModel);
            } else {
                setActiveChat({
                    id: chatDataInfo.id,
                    title: chatDataInfo.title || '',
                    model: selectedModel,
                    engine: selectedModel.engine,
                    role: selectedModel.role,
                    name: selectedModel.name,
                    avatar: selectedModel.avatar,
                    provider: chatDataInfo.provider,
                    modelCodeName: selectedModel.modelCodeName,
                    modelAllowed: selectedModel.allowed
                });
                setModel(selectedModel);
            }
            console.log(JSON.stringify({ userId: user.userId, chatId }))
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
            if (error.response?.status === 404) {
                router.prefetch('/chat');
            }
        } finally {
            setIsLoading(false);
        }
    }, [user?.userId, router]);

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
            modelAllowed:{}
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

    const generateResponse = async (content, fileData = null) => {
        if ((!content?.trim() && !fileData) || !user?.userId || isGenerating || !activeChat?.model) {
            toast.error('Please ensure all requirements are met before sending a message');
            return;
        }

        setIsGenerating(true);
        const userMessageId = nanoid();
        const assistantMessageId = nanoid();
        let chatId = activeChat.id;

        try {
            // If no active chat, create one first
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

            // Add the user message to local state
            const userMessage = {
                id: userMessageId,
                role: 'user',
                content: content.trim(),
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, userMessage]);

            // Add empty assistant message that will be updated with the stream
            const assistantMessage = {
                id: assistantMessageId,
                role: 'assistant',
                content: '',
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, assistantMessage]);

            // First, ensure the user message is saved to the database
            await fetch('/api/chat/addMessage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.userId,
                    chatId,
                    content: content.trim(),
                    role: 'user'
                }),
            });

            // Then send request for AI response
            const messageResponse = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.userId,
                    chatId,
                    content: content.trim(),
                    persona: activeChat.model,
                    provider: activeChat.provider,
                    file: fileData
                }),
            });

            if (!messageResponse.ok) throw new Error('Failed to send message');

            const reader = messageResponse.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = '';

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

            await fetchChats();
        } catch (error) {
            console.error('Error generating response:', error);
            setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId && msg.id !== userMessageId));
            toast.error(`Failed to generate response: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleSearch = useCallback(() => setIsSearchOpen(prev => !prev), []);

    const filteredMessages = useCallback(() => {
        return messages.filter(message => {
            const matchesSearch = message.content.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = searchFilter === 'all' || message.role === searchFilter;
            return matchesSearch && matchesFilter;
        });
    }, [messages, searchTerm, searchFilter]);

    // Fetch chat list when user is available
    useEffect(() => {
        if (user?.userId) {
            fetchChats();
        }
    }, [user?.userId, fetchChats]);

    // Set active chat based on route params
    useEffect(() => {
        if (params?.chatId && user?.userId && !activeChat.id) {
            if (params.chatId.match(/^[a-zA-Z0-9-_]+$/)) {
                setActiveChat(prev => ({ ...prev, id: params.chatId }));
            }
        }
    }, [params?.chatId, user?.userId]);

    // Fetch chat data when active chat changes
    useEffect(() => {
        if (params?.chatId && activeChat?.id && user?.userId && messages.length === 0) {
            fetchChatData(activeChat.id);
        }
    }, [params?.chatId, activeChat?.id, user?.userId, messages.length, fetchChatData]);

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