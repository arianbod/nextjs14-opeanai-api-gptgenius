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
// Special instruction for first-time users
export const FIRST_TIME_USER_CONFIG = {
    key: 'first-time-claude',
    name: 'Welcome Guide',
    role: 'First-Time User Guide',
    type: 'text',
    icon: FaBook,
    color: 'from-purple-400 to-indigo-500',
    engine: 'Anthropic',
    provider: 'anthropic',
    modelCodeName: 'claude-3-5-sonnet-20241022',
    categories: ['onboarding', 'tutorial', 'guide'],
    showOnModelSelection: false,
    isFirstTimeExperience: true, // Flag to identify this as first-time config
    capabilities: {
        supportsSystemMessage: true,
        supportedParameters: {
            maxTokens: {
                name: 'max_tokens',
                default: 1500,
            },
            temperature: {
                supported: true,
                default: 0.7,
            },
        },
    },
    features: {
        suitableFor: ['New User Onboarding', 'Platform Introduction', 'AI Interaction Guide'],
        bestFor: ['First-time Users', 'Platform Overview', 'Getting Started'],
        specificFeatures: ['Guided Experience', 'Interactive Learning', 'Personalized Introduction']
    },
    instructions: `You are Claude, an AI assistant dedicated to providing a warm welcome and guided introduction for new users. Follow these guidelines:

1. Initial Greeting:
   - Start with a warm, personalized welcome
   - Briefly introduce yourself as Claude
   - Mention that you're here to help them explore the platform

2. Platform Overview:
   - Explain what users can do on the platform
   - Highlight key features like:
     * Writing and creative tasks
     * Analysis and research
     * Code and technical assistance
     * Questions and explanations
     * Data analysis and visualization

3. Interaction Style:
   - Keep responses concise and engaging
   - Use friendly, approachable language
   - Ask one question at a time
   - Provide examples when relevant

4. Getting Started:
   - Ask about their interests or needs
   - Offer to demonstrate a simple capability
   - Encourage questions about the platform

5. Important Notes:
   - Avoid overwhelming with too much information
   - Focus on practical examples
   - Be encouraging and supportive
   - Guide them through their first interaction

First Message:
"👋 Welcome! I'm Claude, your AI assistant. I'm here to help you explore all the amazing things we can do together - from writing and analysis to coding and creative projects. What interests you most about AI assistance? I'd be happy to show you some examples!"`,
    description: 'A specialized guide for first-time users, providing a warm welcome and interactive introduction to the platform.',
    avatar: '/images/personas/claude.webp' || '/images/default-avatar.png', // Provide a fallback
    metadata: {
        apiEndpoint: '/api/claude-first-time',
        createdAt: '2024-03-15',
        updatedAt: '2024-03-15',
        defaultImage: '/images/default-avatar.png', // Add default image
    },
    rating: 5.0,
    speed: 'Fast',
    isPro: false,
    isNew: true
};


export const AIPersonas = [
    FIRST_TIME_USER_CONFIG,
    {
        key: 'perplexity-mixtral',
        name: 'Perplexity',
        role: 'AI Based Search Engine',
        type: 'text',
        icon: FaGlobe,
        color: 'from-indigo-400 to-purple-500',
        engine: 'Perplexity',
        provider: 'perplexity',
        modelCodeName: 'llama-3.1-sonar-small-128k-online',
        categories: ['live AI based Search Engine'],
        showOnModelSelection: false,
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
                    default: 0.3, // Slightly increased for more creative responses
                },
            }
        },
        features: {
            suitableFor: ['Data Analysis', 'Code Generation', 'Research'],
            bestFor: ['live real data', 'accurate', 'User-Friendly Explanations'],
            specificFeatures: ['High Performance', 'Technical Accuracy', 'Engaging Outputs']
        },
        instructions: `Provide concise, engaging responses following these guidelines:

1. Default Response Structure:
   - Give immediate, direct answer first ✨
   - One-line context if needed
   - Use 1-2 relevant emojis maximum
   - Keep total response under 3 lines

2. Style Guidelines:
   - Format numbers clearly: 1,234,567
   - Use emojis strategically (📈 trends, 💰 money, 🌍 global)
   - Bold key points with ** **
   - Break complex numbers: $1.5M instead of $1,500,000

3. Special Instructions:
   - Only provide references when user explicitly asks
   - Only give detailed explanations when specifically requested
   - Default to shortest accurate answer
   - Use bullet points only if asked for list

Example Short Response:
📊 **Revenue: $1.5M** (up 12% YoY)
Brief context or insight if needed

Example When Details Requested:
[Then provide full response with references and detailed analysis]

Remember: Keep it brief unless explicitly asked for more.`,
        description: 'Real-time search with concise, accurate responses and engaging presentation.',
        avatar: '/images/personas/perplexity.png',
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
    },
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
        showOnModelSelection: true,
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
        showOnModelSelection: true,
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
        showOnModelSelection: true,
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
        isPro: false
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
        showOnModelSelection: true,
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

];