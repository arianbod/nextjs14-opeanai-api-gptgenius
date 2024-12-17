'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/prisma/db';
import { getUserById } from './auth';
import { getChatProvider } from '@/lib/ai-providers/server';

// server/chat.js (relevant part)
// server/chat.js (relevant part)
async function generateChatTitle(initialMessage) {
    try {
        const provider = getChatProvider('openai');
        const formattedMessages = provider.formatMessages({
            persona: {
                name: "Title Generator",
                role: "Assistant that generates short, relevant titles",
                instructions: "Generate a short, relevant title for conversations based on the initial message. Keep the title concise, preferably under 6 words.",
                modelCodeName: "gpt-3.5-turbo",
                provider: "openai",
                capabilities: {
                    supportsSystemMessage: true,
                    supportedParameters: {
                        temperature: {
                            supported: true,
                            default: 0.7
                        },
                        maxTokens: {
                            name: 'max_tokens',
                            default: 20
                        }
                    }
                }
            },
            previousMessages: [
                {
                    role: "user",
                    content: `Generate a title for a conversation that starts with this message: ${initialMessage}`
                }
            ]
        });

        const stream = await provider.generateChatStream(formattedMessages, {
            modelCodeName: "gpt-3.5-turbo",
            capabilities: {
                supportsSystemMessage: true,
                supportedParameters: {
                    temperature: {
                        supported: true,
                        default: 0.7
                    },
                    maxTokens: {
                        name: 'max_tokens',
                        default: 120
                    }
                }
            }
        });

        let title = '';
        for await (const chunk of stream) {
            // console.log('Chunk:', chunk);
            const chunkContent = provider.extractContentFromChunk(chunk);
            // console.log('Chunk content:', chunkContent);
            if (typeof chunkContent === 'string' && chunkContent) {
                title += chunkContent;
            } else {
                console.warn('Received non-string chunk content:', chunkContent);
            }
        }

        // console.log('Generated title:', title);
        return title || "New Conversation";
    } catch (error) {
        console.error('Error generating chat title:', error);
        return "New Conversation";
    }
}

export async function createChat(userId, initialMessage, model) {
    const user = await getUserById(userId);
    if (!user) {
        console.error('User not found:', userId);
        throw new Error('User not authenticated');
    }

    try {
        const title = await generateChatTitle(initialMessage);

        const chat = await prisma.chat.create({
            data: {
                title,
                titleUpdated: false,
                userId: user.id,
                model: model.name,
                modelCodeName: model.modelCodeName,
                provider: model.provider,
                role: model.role,
            },
        });

        // Remove this line to prevent duplicate message
        // const message = await addMessageToChat(userId, chat.id, initialMessage, 'user');

        revalidatePath('/chat');

        return chat;
    } catch (error) {
        console.error('Error creating chat:', error);
        throw error;
    }
}

export async function getChatList(userId) {
    // console.log('Fetching chat list for user:', userId);
    const user = await getUserById(userId);
    if (!user) {
        console.error('User not found:', userId);
        throw new Error('User not authenticated');
    }

    const chats = await prisma.chat.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        select: {
            id: true,
            title: true,
            modelCodeName: true,
            titleUpdated: true,
            createdAt: true,
            updatedAt: true, provider: true, model: true
        },
    });
    // console.log('Chats found:', chats.length);

    return chats;
}

export async function getChatMessages(userId, chatId) {
    // console.log('Fetching messages for user:', userId, 'in chat:', chatId);
    const user = await getUserById(userId);
    if (!user) {
        console.error('User not found:', userId);
        throw new Error('User not authenticated');
    }

    const chatIdString = Array.isArray(chatId) ? chatId[0] : chatId;

    const messages = await prisma.message.findMany({
        where: {
            chatId: chatIdString,
            chat: { userId }
        },
        orderBy: { createdAt: 'asc' },
        select: {
            id: true,
            content: true,
            role: true,
            createdAt: true
        }
    });

    return messages.map(message => ({
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: message.createdAt.toISOString()
    }));
}

export async function addMessageToChat(userId, chatId, content, role) {
    // console.log('Adding message for user:', userId, 'to chat:', chatId);
    const user = await getUserById(userId);
    if (!user) {
        console.error('User not found:', userId);
        throw new Error('User not authenticated');
    }

    const chatIdString = Array.isArray(chatId) ? chatId[0] : chatId;

    let chat = await prisma.chat.findUnique({
        where: { id: chatIdString },
    });

    if (!chat) {
        // console.log('Chat not found, creating new chat');
        chat = await prisma.chat.create({
            data: {
                id: chatIdString,
                title: "New Chat",
                titleUpdated: false,
                userId: user.id,
            },
        });
    }

    const message = await prisma.message.create({
        data: {
            content,
            role,
            chatId: chatIdString,
        },
    });

    await prisma.chat.update({
        where: { id: chatIdString },
        data: { updatedAt: new Date() },
    });

    revalidatePath(`/chat/${chatIdString}`);
    return message;
}

export async function deleteChat(userId, chatId) {
    console.log('Deleting chat:', chatId, 'for user:', userId);
    const user = await getUserById(userId);
    if (!user) {
        console.error('User not found:', userId);
        throw new Error('User not authenticated');
    }

    const chatIdString = Array.isArray(chatId) ? chatId[0] : chatId;

    await prisma.chat.delete({
        where: { id: chatIdString, userId: user.id },
    });
    console.log('Chat deleted');

    revalidatePath('/chat');
}

export async function manageUserTokens(userId, amount) {
    console.log('Managing tokens for user:', userId);
    const user = await getUserById(userId);
    if (!user) {
        console.error('User not found:', userId);
        throw new Error('User not authenticated');
    }

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { tokenBalance: { increment: amount } },
    });
    console.log('Updated token balance:', updatedUser.tokenBalance);

    return updatedUser.tokenBalance;
}

export async function generateChatResponse(messages, persona) {
    if (!Array.isArray(messages)) {
        console.error('Messages is not an array:', messages);
        throw new Error('Invalid messages format');
    }

    try {
        const provider = getChatProvider(persona.provider || 'openai');
        const formattedMessages = provider.formatMessages({ persona, previousMessages: messages });
        return await provider.generateChatStream(formattedMessages, persona);
    } catch (error) {
        console.error('Error generating chat response:', error);
        throw error;
    }
}

export async function generateImage(userId, prompt, chatId) {
    console.log('Generating image for user:', userId, 'in chat:', chatId);
    const user = await getUserById(userId);
    if (!user) {
        console.error('User not found:', userId);
        throw new Error('User not authenticated');
    }

    const chatIdString = Array.isArray(chatId) ? chatId[0] : chatId;

    try {
        const requiredTokens = 50;
        if (user.tokenBalance < requiredTokens) {
            throw new Error('Insufficient tokens for image generation');
        }

        // Update token balance
        await manageUserTokens(userId, -requiredTokens);

        // Get default image provider
        const provider = getChatProvider('openai');
        const response = await provider.generateImage(prompt);

        if (response.url) {
            // Add image message to chat
            await addMessageToChat(user.id, chatIdString, response.url, 'assistant');
            return { imageUrl: response.url };
        } else {
            throw new Error('Image URL not found in the response');
        }
    } catch (error) {
        console.error('Error in generateImage:', error);
        // Refund tokens if generation failed
        if (error.message !== 'Insufficient tokens for image generation') {
            await manageUserTokens(userId, requiredTokens);
        }
        return { error: 'Failed to generate image. Please try again later.' };
    }
}
export async function getChatInfo(chatId) {
    try {

        const chatInfo = await prisma.chat.findUnique({ where: { id: chatId }, select: { id: true, provider: true, model: true, modelCodeName: true, title: true } })
        // console.log("chatInfo", chatInfo);
        return chatInfo
    } catch (error) {
        console.error("there is an error on getchatinfo", error);
        throw new Error(error)
    }

}

export async function updateChatMetadata(chatId, metadata) {
    try {
        await prisma.chat.update({
            where: { id: chatId },
            data: {
                metadata: {
                    ...(await getChatMetadata(chatId)),
                    ...metadata
                }
            }
        });
    } catch (error) {
        console.error('Error updating chat metadata:', error);
        throw error;
    }
}

export async function getChatMetadata(chatId) {
    try {
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
            select: { metadata: true }
        });
        return chat?.metadata || {};
    } catch (error) {
        console.error('Error getting chat metadata:', error);
        throw error;
    }
}