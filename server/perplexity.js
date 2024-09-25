"use server"

import axios from "axios"

const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
}

export const fetchPerplexity = async (query) => {
    try {
        console.log("The user asked:", query);

        const payload = {
            model: "llama-3.1-sonar-small-128k-online", // or another model of your choice
            messages: [
                {
                    role: "system",
                    content: "Be precise and concise.",
                },
                {

                    role: "user",
                    content: query
                }
            ]
        };

        const res = await axios.post(process.env.PERPLEXITY_API_ENDPOINT, payload, { headers })
        console.log("Response received:", res.data);
        console.log(res.data.choices[0].message.content)
        return res.data.choices[0].message.content;

    } catch (error) {
        console.error("Error fetching data from Perplexity API:", error);
        throw new Error("Failed to fetch data from Perplexity API");
    }
}