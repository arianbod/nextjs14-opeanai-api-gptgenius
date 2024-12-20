// temporary perplexity server side service
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
            model: "llama-3.1-sonar-small-128k-online", // Good choice for real-time web search
            messages: [
                {
                    role: "system",
                    content: "Be precise and concise.",
                },
                {
                    role: "user",
                    content: query
                }
            ],
            max_tokens: 256, // Uncomment and adjust as needed
            // temperature: 0.2, // Uncomment for more focused responses
            // top_p: 0.9, // Uncomment for a good balance of creativity and focus
            // return_citations: true, // Uncomment to get source information
            // search_domain_filter: ["perplexity.ai"], // Keep commented unless you want to restrict searches
            // return_images: false, // Keep commented unless you specifically need images
            // return_related_questions: true, // Uncomment to get related questions
            search_recency_filter: "month", // Uncomment for recent information
            // top_k: 0, // Keep commented as the default is usually fine
            // stream: false, // Keep this false for easier handling
            // presence_penalty: 0, // Keep commented unless you have specific reasons to use it
            // frequency_penalty: 0.5 // Uncomment to reduce repetition in longer responses
        }

        const res = await axios.post(process.env.PERPLEXITY_API_ENDPOINT, payload, { headers })
        console.log("Response received:", res.data);
        console.log(res.data.choices[0].message.content)
        return res.data.choices[0].message.content;

    } catch (error) {
        console.error("Error fetching data from Perplexity API:", error);
        throw new Error("Failed to fetch data from Perplexity API");
    }
}