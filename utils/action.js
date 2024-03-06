'use server'
import prisma from "@/prisma/db";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export const generateChatResponse = async (chatMessages) => {
    try {

        // Then, inside an async function where you have access to the request object:
        const response = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: 'you are a helpful assistant' },
                ...chatMessages
            ],
            model: 'gpt-3.5-turbo',
            temperature: 1,
            max_tokens: 100
        })
        return { message: response.choices[0].message, tokens: response.usage.total_tokens }
    } catch (error) {
        console.log(error);
        return null
    }
}

export const getExistingTour = async ({ city, country }) => {

    return prisma.tour.findUnique({
        where: {
            city_country: {
                city, country
            }
        }
    })


}
export const generateTourResponse = async ({ city, country }) => {
    const query = `Find a exact ${city} in this exact ${country}.
If ${city} and ${country} exist, create a list of things families can do in this ${city},${country}. 
Once you have a list, create a one-day tour. Response should be  in the following JSON format: 
{
  "tour": {
    "city": "${city}",
    "country": "${country}",
    "title": "title of the tour",
    "description": "short description of the city and tour",
    "stops": ["stop name 1", "stop name 2"]
  }
}
"stops" property should include only two stops.
If you can't find info on exact ${city}, or ${city} does not exist, or it's population is less than 1, or it is not located in the following ${country},   return { "tour": null }, with no additional characters.`;
    try {
        const response = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: 'you are a tour guide' },
                { role: 'user', content: query }
            ]
            , model: 'gpt-3.5-turbo'
            , temperature: 0.5,

        })
        const tourData = JSON.parse(response.choices[0].message.content)
        if (!tourData.tour) {
            return null
        }
        subtractTokens();
        return tourData.tour
    } catch (error) {
        console.log(error);
    }
}
export const createNewTour = async (tour) => {
    return prisma.tour.create({
        data: tour
    })
}

export const getAllTours = async (searchTerm) => {
    if (!searchTerm) {
        const tours = await prisma.tour.findMany({
            orderBy: {
                country: "asc"
            }

        })
        return tours
    }
    const tours = await prisma.tour.findMany({
        where: {
            OR: [
                { city: { contains: searchTerm } },
                { country: { contains: searchTerm } }
            ]
        }
        ,
        orderBy: {
            city: "asc"
        }
    })
    return tours
}

export const getSingleTour = async (id) => {

    return prisma.tour.findUnique({
        where: {
            id,
        }
    })
}
export const fetchUserTokensById = async (clerkId) => {
    const result = await prisma.token.findUnique({
        where: {
            clerkId,
        },
    });

    return result?.tokens;
};

export const generateUserTokensForId = async (clerkId) => {
    const result = await prisma.token.create({
        data: {
            clerkId,
        },
    });
    return result?.tokens;
};

export const fetchOrGenerateTokens = async (clerkId) => {
    const result = await fetchUserTokensById(clerkId);
    if (result) {
        return result.tokens;
    }
    return (await generateUserTokensForId(clerkId)).tokens;
};

export const subtractTokens = async (clerkId, tokens) => {
    const result = await prisma.token.update({
        where: {
            clerkId,
        },
        data: {
            tokens: {
                decrement: tokens,
            },
        },
    });
    revalidatePath('/profile');
    // Return the new token value
    return result.tokens;
};