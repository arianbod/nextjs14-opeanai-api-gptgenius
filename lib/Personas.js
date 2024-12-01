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
    // Add this to the AIPersonas array in lib/Personas.js
    {
        key: 'perplexity-mixtral',
        name: 'Mixtral',
        role: 'Analytical Assistant',
        type: 'text',
        icon: FaGlobe,
        color: 'from-indigo-400 to-purple-500',
        engine: 'Perplexity',
        provider: 'perplexity',
        modelCodeName: 'llama-3.1-sonar-small-128k-online',
        categories: ['analytical', 'coding', 'creative', 'chat'],
        capabilities: {
            supportsSystemMessage: true,
            supportsFormatting: true, // Added formatting support flag
            supportedParameters: {
                maxTokens: {
                    name: 'max_tokens',
                    default: 1024,
                },
                temperature: {
                    supported: true,
                    default: 0.3,
                },
            },
            formatInstructions: `Format responses in HTML when appropriate:
            - For market data: Use <div class="market-data"> with nested elements
            - For currency pairs: Use <div class="currency-pair"> with rate and change information
            - For price analysis: Use <div class="price-analysis"> with structured data
            Example formats:
            <div class="market-data">
                <div class="header">[Title]</div>
                <div class="value">[Value]</div>
                <div class="change">[Change]</div>
            </div>`
        },
        features: {
            suitableFor: ['Data Analysis', 'Code Generation', 'Research'],
            bestFor: ['Complex Problem Solving', 'Technical Explanations'],
            specificFeatures: ['High Performance', 'Technical Accuracy', 'Formatted Outputs']
        },
        instructions: `Be precise and concise. When providing financial data or market information, 
        format the response using appropriate HTML structure as specified in the formatting instructions. 
        Ensure all numerical data is clearly presented and properly formatted.`,
        description: 'Mixtral combines high performance with versatility, excelling at technical analysis, coding, and complex problem-solving tasks.',
        avatar: '/images/personas/chatgpt.jpg',  // Using existing image as fallback
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