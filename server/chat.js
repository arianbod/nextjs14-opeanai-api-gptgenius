'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/prisma/db';
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function ensureUserExists(clerkId) {
    let user = await prisma.user.findUnique({
        where: { id: clerkId },
        include: { token: true }
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                id: clerkId,
                token: {
                    create: {
                        tokens: 3000, // Default token amount
                    },
                },
            },
            include: { token: true }
        });
    } else if (!user.token) {
        await prisma.token.create({
            data: {
                clerkId: clerkId,
                tokens: 3000, // Default token amount
            },
        });
    }

    return user;
}

export async function createChat(clerkId, title) {
    if (!clerkId) {
        throw new Error('User not authenticated')
    }

    await ensureUserExists(clerkId);

    const chat = await prisma.chat.create({
        data: {
            title,
            userId: clerkId,
        },
    })

    revalidatePath('/chat')
    return chat
}

export async function getChatList(clerkId) {
    if (!clerkId) {
        throw new Error('User not authenticated')
    }

    await ensureUserExists(clerkId);

    const chats = await prisma.chat.findMany({
        where: { userId: clerkId },
        orderBy: { updatedAt: 'desc' },
        select: { id: true, title: true },
    })

    return chats
}

export async function getChatMessages(clerkId, chatId) {
    if (!clerkId) {
        throw new Error('User not authenticated')
    }

    await ensureUserExists(clerkId);

    // Ensure chatId is a string
    const chatIdString = Array.isArray(chatId) ? chatId[0] : chatId;

    const messages = await prisma.message.findMany({
        where: {
            chatId: chatIdString,
            chat: { userId: clerkId } // Ensure the chat belongs to the user
        },
        orderBy: { createdAt: 'asc' },
        select: {
            id: true,
            content: true,
            role: true,
            createdAt: true
        }
    })

    return messages.map(message => ({
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: message.createdAt.toISOString()
    }));
}

export async function addMessageToChat(clerkId, chatId, content, role) {
    console.log('Adding message to chat:', { clerkId, chatId, content, role });

    if (!clerkId) {
        throw new Error('User not authenticated')
    }

    await ensureUserExists(clerkId);

    // Ensure chatId is a string
    const chatIdString = Array.isArray(chatId) ? chatId[0] : chatId;

    // Check if the chat exists, if not, create it
    let chat = await prisma.chat.findUnique({
        where: { id: chatIdString },
    });

    if (!chat) {
        chat = await prisma.chat.create({
            data: {
                id: chatIdString,
                title: "New Chat",
                userId: clerkId,
            },
        });
    }

    const message = await prisma.message.create({
        data: {
            content,
            role,
            chatId: chatIdString,
        },
    })

    await prisma.chat.update({
        where: { id: chatIdString },
        data: { updatedAt: new Date() },
    })

    revalidatePath(`/chat/${chatIdString}`)
    return message
}

export async function deleteChat(clerkId, chatId) {
    if (!clerkId) {
        throw new Error('User not authenticated')
    }

    await ensureUserExists(clerkId);

    // Ensure chatId is a string
    const chatIdString = Array.isArray(chatId) ? chatId[0] : chatId;

    await prisma.chat.delete({
        where: { id: chatIdString, userId: clerkId },
    })

    revalidatePath('/chat')
}

export async function manageUserTokens(clerkId, amount) {
    const user = await ensureUserExists(clerkId);

    const updatedToken = await prisma.token.update({
        where: { clerkId },
        data: { tokens: { increment: amount } },
    });

    return updatedToken.tokens;
}

export async function generateChatResponse(clerkId, chatMessagesJson, personaJson, chatId) {
    if (!clerkId) {
        throw new Error('User not authenticated')
    }

    await ensureUserExists(clerkId);

    // Ensure chatId is a string
    const chatIdString = Array.isArray(chatId) ? chatId[0] : chatId;

    try {
        const chatMessages = JSON.parse(chatMessagesJson);
        const persona = JSON.parse(personaJson);

        // Check and deduct tokens
        const requiredTokens = 1; // Adjust based on your token usage policy
        const currentTokens = await manageUserTokens(clerkId, -requiredTokens);
        if (currentTokens < 0) {
            throw new Error('Insufficient tokens');
        }

        const systemMessage = {
            role: 'system',
            content: `You are ${persona.name}, a ${persona.role}. Respond to queries in a manner consistent with your role and expertise. Always stay in character.`
        };

        // Store the user's message in the database
        const userMessage = chatMessages[chatMessages.length - 1];
        await addMessageToChat(clerkId, chatIdString, userMessage.content, userMessage.role);

        const response = await openai.chat.completions.create({
            messages: [
                systemMessage,
                ...chatMessages
            ],
            model: 'gpt-4-1106-preview',
            temperature: 0.7,
            max_tokens: 1000
        });

        const aiMessage = response.choices[0].message;

        try {
            // Store the AI's response in the database
            await addMessageToChat(clerkId, chatIdString, aiMessage.content, aiMessage.role);
        } catch (error) {
            console.error('Error adding AI message to chat:', error);
            // If adding the message fails, we still return the AI response
            // but we log the error and don't throw, allowing the conversation to continue
        }

        return { message: aiMessage };
    } catch (error) {
        console.error('Error in generateChatResponse:', error);
        return { message: { role: 'assistant', content: 'I apologize, but I encountered an error. Please try again later.' } };
    }
}

export async function generateImage(clerkId, prompt, chatId) {
    if (!clerkId) {
        throw new Error('User not authenticated')
    }

    await ensureUserExists(clerkId);

    // Ensure chatId is a string
    const chatIdString = Array.isArray(chatId) ? chatId[0] : chatId;

    try {
        // Check and deduct tokens
        const requiredTokens = 50; // Adjust based on your token usage policy for image generation
        const currentTokens = await manageUserTokens(clerkId, -requiredTokens);
        if (currentTokens < 0) {
            throw new Error('Insufficient tokens for image generation');
        }

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
        });

        if (response.data && response.data[0] && response.data[0].url) {
            await addMessageToChat(clerkId, chatIdString, response.data[0].url, 'assistant');
            return { imageUrl: response.data[0].url };
        } else {
            throw new Error('Image URL not found in the response');
        }
    } catch (error) {
        console.error('Error in generateImage:', error);
        return { error: 'Failed to generate image. Please try again later.' };
    }
}