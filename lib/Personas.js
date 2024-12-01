import {
    FaRobot,
    FaImage,
    FaUserMd,
    FaHardHat,
    FaLaptopCode,
    FaChalkboardTeacher,
    FaBriefcase,
    FaBook,
    FaMusic,
    FaCamera,
    FaChartLine,
    FaGlobe,
} from 'react-icons/fa';
import { SiOpenai } from 'react-icons/si';

export const AIPersonas = [
    // OpenAI Models
    {
        key: 'CHATGPT-o1-preview',
        name: 'o1-preview',
        role: 'CHATGPT',
        type: 'text',
        icon: SiOpenai,
        color: 'from-green-400 to-blue-500',
        engine: 'OpenAI',
        provider: 'openai',
        modelCodeName: 'o1-preview',
        categories: ['creative', 'analytical', 'coding', 'chat'], // Added based on features
        capabilities: {
            supportsSystemMessage: false,
            supportedParameters: {
                maxTokens: {
                    name: 'max_completion_tokens',
                    default: 1000,
                },
                temperature: {
                    supported: false,
                    default: 1,
                },
            },
        },
        features: {
            suitableFor: ['Content Creation', 'Academic Research', 'Coding Assistance'],
            bestFor: ['Detailed Explanations', 'Concise Summaries'],
            specificFeatures: ['Language Support', 'Customization'],
        },
        instructions: 'You are an AI assistant for advanced interactions...',
        description:
            'o1-preview is designed for generating comprehensive and detailed responses, suitable for in-depth analysis and extended conversations.',
        avatar: '/images/personas/chatgpt.jpg',
        metadata: {
            apiEndpoint: '/api/chatgpt-o1-preview',
            usageLimit: 5000,
            createdAt: '2024-01-01',
            updatedAt: '2024-06-01',
        },
        rating: 4.8, // Added rating for sorting
        speed: 'Slow', // Added speed indicator
        isNew: true, // Added new tag
    },
    {
        key: 'CHATGPT-o1-mini',
        name: 'o1-mini',
        role: 'CHATGPT',
        type: 'text',
        icon: SiOpenai,
        color: 'from-gray-400 to-gray-500',
        engine: 'OpenAI',
        provider: 'openai',
        modelCodeName: 'o1-mini',
        categories: ['chat', 'analytical'], // Added based on features
        capabilities: {
            supportsSystemMessage: false,
            supportedParameters: {
                maxTokens: {
                    name: 'max_completion_tokens',
                    default: 1000,
                },
                temperature: {
                    supported: false,
                    default: 1,
                },
            },
        },
        features: {
            suitableFor: ['Quick Queries', 'Customer Support'],
            bestFor: ['Concise Summaries', 'Interactive Assistance'],
            specificFeatures: ['Integration Capabilities'],
        },
        instructions: 'You are an advanced AI assistant...',
        description:
            'o1-mini offers quick and efficient responses, ideal for short queries and fast-paced interactions.',
        avatar: '/images/personas/chatgpt.jpg',
        metadata: {
            apiEndpoint: '/api/chatgpt-o1-mini',
            usageLimit: 3000,
            createdAt: '2024-03-10',
            updatedAt: '2024-08-05',
        },
        rating: 4.5,
        speed: 'Fast'
    },
    {
        key: 'CHATGPT-4o',
        name: '4o',
        role: 'CHATGPT',
        type: 'text',
        icon: SiOpenai,
        color: 'from-green-400 to-blue-500',
        engine: 'OpenAI',
        provider: 'openai',
        modelCodeName: 'chatgpt-4o-latest',
        categories: ['creative', 'analytical', 'chat', 'coding'], // Added based on features
        capabilities: {
            supportsSystemMessage: true,
            supportedParameters: {
                maxTokens: {
                    name: 'max_tokens',
                    default: 1000,
                },
                temperature: {
                    supported: true,
                    default: 0.7,
                },
            },
        },
        features: {
            suitableFor: ['Content Creation', 'Academic Research'],
            bestFor: ['Interactive Assistance', 'Concise Summaries'],
            specificFeatures: ['Customization', 'Real-Time Collaboration'],
        },
        instructions: 'You are an analytical assistant...',
        description:
            '4o is an analytical assistant capable of adjusting response creativity and length, perfect for tailored and nuanced conversations.',
        avatar: '/images/personas/chatgpt.jpg',
        metadata: {
            apiEndpoint: '/api/chatgpt-4o',
            usageLimit: 6000,
            createdAt: '2024-04-15',
            updatedAt: '2024-09-10',
        },
        rating: 4.9,
        speed: 'Very Fast',
        isPro: true
    },
    // Claude Models
    {
        key: 'claude-3-5-sonnet-latest',
        name: 'Claude',
        categories: ['analytical', 'coding', 'creative', 'chat'], // Fixed array format
        role: 'Analytical Assistant',
        type: 'text',
        icon: FaGlobe,
        color: 'from-yellow-400 to-orange-500',
        engine: 'Anthropic',
        provider: 'anthropic',
        modelCodeName: 'claude-3-5-sonnet-20241022',
        capabilities: {
            supportsSystemMessage: true,
            supportedParameters: {
                maxTokens: {
                    name: 'max_tokens',
                    default: 1500,
                },
                temperature: {
                    supported: true,
                    default: 0.6,
                },
            },
        },
        features: {
            suitableFor: ['Data Analysis', 'Academic Research'],
            bestFor: ['Detailed Explanations', 'Data-Driven Decisions'],
            specificFeatures: ['Customization', 'Security Features'],
        },
        instructions:
            'You are an analytical AI assistant, proficient in understanding and generating human-like text based on the provided inputs. Provide clear, concise, and accurate responses to user queries.',
        description:
            'Claude excels in delivering clear and concise analytical insights, making it ideal for data-driven decision-making and detailed explanations.',
        avatar: '/images/personas/claude.webp',
        metadata: {
            apiEndpoint: '/api/claude-3-5-sonnet-latest',
            usageLimit: 7000,
            createdAt: '2024-02-15',
            updatedAt: '2024-07-20',
        },
        rating: 4.9,
        speed: 'Fast',
        isPro: true,
        isNew: true
    },
    {
        key: 'perplexity-mixtral',
        name: 'BabaGPT',
        role: 'Friendly Analytical Assistant',
        type: 'text',
        icon: FaGlobe,
        color: 'from-indigo-400 to-purple-500',
        engine: 'Perplexity',
        provider: 'perplexity',
        modelCodeName: 'llama-3.1-sonar-small-128k-online',
        categories: ['analytical', 'coding', 'creative', 'chat'],
        capabilities: {
            supportsSystemMessage: true,
            supportsFormatting: true,
            supportedParameters: {
                maxTokens: {
                    name: 'max_tokens',
                    default: 1024,
                },
                temperature: {
                    supported: true,
                    default: 0.4, // Slightly increased for more creative responses
                },
            }
        },
        features: {
            suitableFor: ['Data Analysis', 'Code Generation', 'Research'],
            bestFor: ['Complex Problem Solving', 'User-Friendly Explanations'],
            specificFeatures: ['High Performance', 'Technical Accuracy', 'Engaging Outputs']
        },
        instructions: `Present information in a friendly, accessible manner following these guidelines:

    1. Number Formatting:
       - Use thousands separators for large numbers (e.g., 1,234,567)
       - Round decimals to appropriate precision for context
       - Include currency symbols where relevant

    2. Response Structure:
       - Start with a brief, clear summary
       - Break information into digestible sections
       - Use line breaks for better readability
       - Avoid technical jargon unless necessary

    3. Engagement:
       - Include relevant emojis to make responses more engaging
       - Use appropriate emoji context (💱 for currency, 📈 for trends, etc.)
       - Keep emoji usage professional and not excessive

    4. For Financial Data:
       - Always include the current/main value prominently
       - Add recent trends or changes when relevant
       - Provide context for numbers
       - Format percentages consistently

    Example response structure:
    [Main value/point] 💫
    
    [Brief explanation] 📝
    
    [Additional context if needed] ℹ️
    
    [Helpful resources or next steps] 🔍

    Keep responses concise while maintaining clarity and engagement.`,
        description: 'Mixtral delivers technical analysis and data in a friendly, accessible format with clear number formatting and engaging presentation.',
        avatar: '/images/babagpt_bw.svg',
        metadata: {
            apiEndpoint: process.env.PERPLEXITY_API_ENDPOINT || 'https://api.perplexity.ai/chat/completions',
            usageLimit: 10000,
            createdAt: '2024-03-01',
            updatedAt: '2024-03-01',
        },
        rating: 4.7,
        speed: 'Very Fast',
        isPro: true,
        isNew: true
    }
];