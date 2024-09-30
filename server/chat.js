'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/prisma/db';
import OpenAI from "openai";
import { getUserById } from './auth';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function generateChatTitle(content) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini-2024-07-18",
            messages: [
                { role: "system", content: "You are a helpful assistant that generates short, relevant titles for conversations based on the initial message. Keep the title concise, preferably under 6 words." },
                { role: "user", content: `Generate a title for a conversation that starts with this message: "${content}"` }
            ],
            max_tokens: 20,
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating chat title:', error);
        return "New Conversation";
    }
}
export async function createChat(userId, initialMessage) {
    console.log('Creating chat for user:', userId, 'with initial message:', initialMessage);
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
                userId: user.id,
            },
        });
        console.log('Chat created:', chat);

        // Add the initial message to the chat
        await addMessageToChat(userId, chat.id, initialMessage, 'user');

        revalidatePath('/chat');
        return chat;
    } catch (error) {
        console.error('Error creating chat:', error);
        throw error;
    }
}

export async function getChatList(userId) {
    console.log('Fetching chat list for user:', userId);
    const user = await getUserById(userId);
    if (!user) {
        console.error('User not found:', userId);
        throw new Error('User not authenticated');
    }

    const chats = await prisma.chat.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        select: { id: true, title: true },
    });
    console.log('Chats found:', chats.length);

    return chats;
}

export async function getChatMessages(userId, chatId) {
    console.log('Fetching messages for user:', userId, 'in chat:', chatId);
    const user = await getUserById(userId);
    if (!user) {
        console.error('User not found:', userId);
        throw new Error('User not authenticated');
    }

    const chatIdString = Array.isArray(chatId) ? chatId[0] : chatId;

    const messages = await prisma.message.findMany({
        where: {
            chatId: chatIdString,
            chat: { userId: user.id }
        },
        orderBy: { createdAt: 'asc' },
        select: {
            id: true,
            content: true,
            role: true,
            createdAt: true
        }
    });
    console.log('Messages found:', messages.length);

    const serializedMessages = messages.map(message => ({
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: message.createdAt.toISOString()
    }));

    console.log('Serialized messages:', JSON.stringify(serializedMessages, null, 2));

    return serializedMessages;
}


export async function addMessageToChat(userId, chatId, content, role) {
    console.log('Adding message for user:', userId, 'to chat:', chatId);
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
        console.log('Chat not found, creating new chat');
        chat = await prisma.chat.create({
            data: {
                id: chatIdString,
                title: "New Chat",
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
    console.log('Message added:', message.id);

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

    // Ensure chatId is a string
    const chatIdString = Array.isArray(chatId) ? chatId[0] : chatId;

    await prisma.chat.delete({
        where: { id: chatIdString, userId: user.id },
    });
    console.log('Chat deleted');

    revalidatePath('/chat');
}

export async function manageUserTokens(userId, amount) {
    console.log('Managing tokens for user:', userId, 'amount:', amount);
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
    // Ensure messages is an array
    if (!Array.isArray(messages)) {
        console.error('Messages is not an array:', messages);
        throw new Error('Invalid messages format');
    }

    const systemMessage = {
        role: 'system',
        content: `You are ${persona.name}, a ${persona.role}. Respond to queries in a manner consistent with your role and expertise. Always stay in character.`
    };

    try {
        const stream = await openai.chat.completions.create({
            messages: [
                systemMessage,
                ...messages
            ],
            model: 'gpt-4o-mini-2024-07-18',
            temperature: 0.7,
            max_tokens: 1000,
            stream: true,
        });

        return stream;
    } catch (error) {
        console.error('Error in OpenAI API call:', error);
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

    // Ensure chatId is a string
    const chatIdString = Array.isArray(chatId) ? chatId[0] : chatId;

    try {
        // Check and deduct tokens
        const requiredTokens = 50; // Adjust based on your token usage policy for image generation
        // const currentTokens = await manageUserTokens(user.id, -requiredTokens);
        if (user.tokenBalance < requiredTokens) {
            throw new Error('Insufficient tokens for image generation');
        }

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
        });

        if (response.data && response.data[0] && response.data[0].url) {
            await addMessageToChat(user.id, chatIdString, response.data[0].url, 'assistant');
            return { imageUrl: response.data[0].url };
        } else {
            throw new Error('Image URL not found in the response');
        }
    } catch (error) {
        console.error('Error in generateImage:', error);
        return { error: 'Failed to generate image. Please try again later.' };
    }
}