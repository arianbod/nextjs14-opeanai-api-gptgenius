'use server'
import prisma from "@/prisma/db";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const TOKEN_COSTS = {
    CHAT: 1,
    IMAGE: 50,
    TRANSLATION: 5,
    TOUR: 10,
};

export const subtractTokens = async (userId, tokens) => {
    const currentTokens = await fetchUserTokensById(userId);
    if (currentTokens < tokens) {
        return { tokens: currentTokens, warning: 'Insufficient tokens. Please recharge to continue using the service.' };
    }
    const result = await prisma.token.update({
        where: { userId },
        data: { tokens: { decrement: tokens } },
    });
    revalidatePath('/');
    return { tokens: result.tokens };
};

export const generateChatResponse = async (chatMessagesJson, userId, personaJson) => {
    try {
        const { tokens, warning } = await subtractTokens(userId, TOKEN_COSTS.CHAT);
        if (warning) {
            return { message: warning, tokens };
        }

        const chatMessages = JSON.parse(chatMessagesJson);
        const persona = JSON.parse(personaJson);

        // Create a system message based on the persona
        const systemMessage = {
            role: 'system',
            content: `You are ${persona.name}, a ${persona.role}. Respond to queries in a manner consistent with your role and expertise. Always stay in character.`
        };

        const response = await openai.chat.completions.create({
            messages: [
                systemMessage,
                ...chatMessages
            ],
            model: 'gpt-4-1106-preview',
            temperature: 0.7,
            max_tokens: 1000
        });

        return { message: response.choices[0].message, tokens: response.usage.total_tokens };
    } catch (error) {
        console.error('Error in generateChatResponse:', error);
        return { message: { role: 'assistant', content: 'I apologize, but I encountered an error. Please try again later.' }, tokens: 0 };
    }
};

export const generateImage = async (prompt, userId) => {
    try {
        const { tokens, warning } = await subtractTokens(userId, TOKEN_COSTS.IMAGE);
        if (warning) {
            return { error: warning, tokens };
        }

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
        });

        if (response.data && response.data[0] && response.data[0].url) {
            return { imageUrl: response.data[0].url, tokens };
        } else {
            throw new Error('Image URL not found in the response');
        }
    } catch (error) {
        console.error('Error in generateImage:', error);
        return { error: 'Failed to generate image. Please try again later.', tokens: 0 };
    }
};

export const translateText = async (text, targetLang, userId) => {
    try {
        const { tokens, warning } = await subtractTokens(userId, TOKEN_COSTS.TRANSLATION);
        if (warning) {
            return { error: warning, tokens };
        }

        const response = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: `You are a highly skilled translator. Translate the following text to ${targetLang}. Maintain the original meaning, tone, and style as closely as possible.` },
                { role: 'user', content: text }
            ],
            model: 'gpt-4-1106-preview',
            temperature: 0.3,
            max_tokens: 1000
        });

        const translatedText = response.choices[0].message.content.trim();

        return { translatedText, tokens: response.usage.total_tokens };
    } catch (error) {
        console.error('Error in translateText:', error);
        return { error: 'Translation failed. Please try again later.', tokens: 0 };
    }
};

export const generateTourResponse = async ({ city, country }, userId) => {
    try {
        const { tokens, warning } = await subtractTokens(userId, TOKEN_COSTS.TOUR);
        if (warning) {
            return { error: warning, tokens };
        }

        const query = `Create a one-day tour for families visiting ${city}, ${country}. Include:
        1. A brief description of the city (50 words max)
        2. A catchy title for the tour
        3. Four interesting stops, each with a short description (30 words max per stop)
        4. A fun fact about the city or country

        Format the response as a JSON object. If the city doesn't exist or isn't in the specified country, return { "tour": null }.`;

        const response = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are an expert tour guide with extensive knowledge of global destinations.' },
                { role: 'user', content: query }
            ],
            model: 'gpt-4-1106-preview',
            temperature: 0.7,
        });

        const tourData = JSON.parse(response.choices[0].message.content);
        if (!tourData.tour) {
            return { tour: null, tokens };
        }

        return { tour: tourData.tour, tokens: response.usage.total_tokens };
    } catch (error) {
        console.error('Error in generateTourResponse:', error);
        return { error: 'Failed to generate tour. Please try again later.', tokens: 0 };
    }
};

export const createNewTour = async (tour) => {
    return prisma.tour.create({ data: tour });
};

export const getAllTours = async (searchTerm) => {
    const whereClause = searchTerm
        ? {
            OR: [
                { city: { contains: searchTerm, mode: 'insensitive' } },
                { country: { contains: searchTerm, mode: 'insensitive' } }
            ]
        }
        : {};

    return prisma.tour.findMany({
        where: whereClause,
        orderBy: { country: "asc" },
    });
};

export const getSingleTour = async (id) => {
    return prisma.tour.findUnique({ where: { id } });
};

export const fetchUserTokensById = async (userId) => {
    if (!userId) {
        console.log("No userId provided");
        return 0;
    }

    try {
        const result = await prisma.token.findUnique({
            where: { userId },
        });

        return result?.tokens || 0;
    } catch (error) {
        console.error("Error fetching user tokens:", error);
        return 0;
    }
};

export const generateUserTokensForId = async (userId) => {
    const result = await prisma.token.create({
        data: {
            userId,
            tokens: 100, // Start with 100 tokens for new users
        },
    });
    return result.tokens;
};

export const fetchOrGenerateTokens = async (userId) => {
    let tokens = await fetchUserTokensById(userId);
    if (tokens === 0) {
        tokens = await generateUserTokensForId(userId);
    }
    return tokens;
};

export const rechargeTokens = async (userId, amount) => {
    const result = await prisma.token.update({
        where: { userId },
        data: { tokens: { increment: amount } },
    });
    revalidatePath('/');
    return result.tokens;
};