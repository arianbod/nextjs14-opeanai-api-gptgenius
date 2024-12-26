// @/lib/personas/personas.js

import { createModelConfig } from './personas/utils/modelFactory';
import { globalInstruction } from './personas/globalInstruction';
import { searchEngineInstruction } from './personas/searchEngineInstruction';
import { welcomeInstruction } from './personas/welcomeInstruction';

// Create all AI personas configurations
export const AIPersonas = [
   // Claude Models
   createModelConfig({
      key: 'welcome-host-claude-3-5-sonnet-latest',
      name: 'Claude',
      categories: ['coding', 'chat'],
      role: 'welcome chat',
      provider: 'anthropic',
      modelCodeName: 'claude-3-5-sonnet-20241022',
      instructions: welcomeInstruction,
      description: 'A specialized guide for first-time users, providing a warm welcome and interactive introduction to the platform.',
      rating: 4.9,
      isPro: true,
      isNew: true,
      showOnModelSelection: false,
      features: {
         suitableFor: ['Data Analysis', 'Academic Research'],
         bestFor: ['Detailed Explanations', 'Data-Driven Decisions'],
         specificFeatures: ['Customization', 'Security Features'],
      },
   }),

   createModelConfig({
      key: 'claude-3-5-sonnet-latest',
      name: 'Claude with vision',
      categories: ['vision', 'complex reasoning', 'coding', 'chat'],
      role: 'Analytical Assistant',
      provider: 'anthropic',
      modelCodeName: 'claude-3-5-sonnet-20241022',
      hasVision: true,
      description: 'Claude excels in delivering clear and concise analytical insights, making it ideal for data-driven decision-making and detailed explanations.',
      rating: 4.9,
      speed: 'Fast',
      isPro: true,
      isNew: true,
      instructions: globalInstruction.replace("{{{_AI_ASSISTANT_}}}", 'Claude'),
      features: {
         suitableFor: ['Data Analysis', 'Academic Research'],
         bestFor: ['Detailed Explanations', 'Data-Driven Decisions'],
         specificFeatures: ['Customization', 'Security Features'],
      },
   }),

   // OpenAI Models
   createModelConfig({
      key: 'CHATGPT-o1-preview',
      name: 'o1-preview',
      role: 'CHATGPT',
      provider: 'openai',
      modelCodeName: 'o1-preview',
      categories: ['complex reasoning'],
      capabilities: {
         supportsSystemMessage: false,
         supportedParameters: {
            maxTokens: {
               name: 'max_completion_tokens',
               default: 8000,
            },
            temperature: {
               supported: false,
               default: 1,
            },
         },
      },
      instructions: globalInstruction.replace("{{{_AI_ASSISTANT_}}}", 'o1-preview'),
      description: 'o1-preview is designed for generating comprehensive and detailed responses, suitable for in-depth analysis and extended conversations.',
      rating: 4.8,
      speed: 'Slow',
      isNew: true,
      features: {
         suitableFor: ['Content Creation', 'Academic Research', 'Coding Assistance'],
         bestFor: ['Detailed Explanations', 'Concise Summaries'],
         specificFeatures: ['Language Support', 'Customization'],
      },
   }),

   createModelConfig({
      key: 'gpt-4o-mini',
      name: '4o-mini with Vision',
      role: 'Visual Analysis Assistant',
      provider: 'openai',
      modelCodeName: 'gpt-4o-mini',
      categories: ['vision', 'chat'],
      hasVision: true,
      rating: 4.8,
      speed: 'Fast',
      isPro: true,
      features: {
         suitableFor: ['Image Analysis', 'Visual Description', 'Document Understanding'],
         bestFor: ['Visual Content Analysis', 'Image-based Queries', 'Visual Problem Solving'],
         specificFeatures: ['Image Understanding', 'Multi-modal Interaction', 'Detailed Visual Analysis'],
      },
      description: 'Advanced vision-enabled AI assistant capable of analyzing images and providing detailed visual understanding.',
      instructions: globalInstruction.replace("{{{_AI_ASSISTANT_}}}", 'o1-preview'),
   }),

   createModelConfig({
      key: 'CHATGPT-o1-mini',
      name: 'o1-mini',
      role: 'CHATGPT',
      provider: 'openai',
      modelCodeName: 'o1-mini',
      categories: ['coding'],
      color: 'from-gray-400 to-gray-500',
      capabilities: {
         supportsSystemMessage: false,
         supportedParameters: {
            maxTokens: {
               name: 'max_completion_tokens',
               default: 8000,
            },
            temperature: {
               supported: false,
               default: 1,
            },
         },
      },
      instructions: globalInstruction.replace("{{{_AI_ASSISTANT_}}}", 'o1-mini'),
      description: 'o1-mini offers quick and efficient responses, ideal for short queries and fast-paced interactions.',
      rating: 4.5,
      speed: 'Fast',
      features: {
         suitableFor: ['Quick Queries', 'Customer Support'],
         bestFor: ['Concise Summaries', 'Interactive Assistance'],
         specificFeatures: ['Integration Capabilities'],
      },
   }),

   // X Models
   createModelConfig({
      key: 'x-grok-2-vision-1212',
      name: 'X with Vision',
      categories: ['vision', 'coding', 'chat'],
      role: 'Analytical Assistant',
      provider: 'x',
      modelCodeName: 'grok-2-vision-1212',
      hasVision: true,
      description: 'X is an advanced analytical assistant designed to provide tailored, in-depth analysis across various fields.',
      rating: 4.9,
      speed: 'Fast',
      isPro: true,
      isNew: true,
      instructions: globalInstruction.replace("{{{_AI_ASSISTANT_}}}", 'X'),
      features: {
         suitableFor: ['Data Analysis', 'Academic Research', 'Technical Support'],
         bestFor: ['In-Depth Analysis', 'Customized Learning', 'Interactive Coding'],
         specificFeatures: ['Adaptive Communication', 'Advanced Security', 'Real-Time Collaboration'],
      },
   }),

   createModelConfig({
      key: 'x-grok-2-1212',
      name: 'X',
      categories: ['coding', 'chat'],
      role: 'Analytical Assistant',
      provider: 'x',
      modelCodeName: 'grok-2-vision-1212',
      description: 'X is an advanced analytical assistant designed for general-purpose AI interactions.',
      rating: 4.9,
      speed: 'Fast',
      isPro: true,
      isNew: true,
      instructions: globalInstruction.replace("{{{_AI_ASSISTANT_}}}", 'X'),
      features: {
         suitableFor: ['Data Analysis', 'Academic Research', 'Technical Support'],
         bestFor: ['In-Depth Analysis', 'Customized Learning', 'Interactive Coding'],
         specificFeatures: ['Adaptive Communication', 'Advanced Security', 'Real-Time Collaboration'],
      },
   }),

   // Gemini Model
   createModelConfig({
      key: 'gemini-vision-flash',
      name: 'Gemini with Vision',
      categories: ['complex reasoning', 'coding', 'chat'],
      role: 'Versatile AI Assistant',
      provider: 'gemini',
      modelCodeName: 'gemini-2.0-flash-exp',
      hasVision: true,
      description: 'Gemini is a versatile AI assistant combining natural language understanding with vision capabilities.',
      rating: 4.8,
      speed: 'Very Fast',
      isPro: true,
      isNew: true,
      instructions: globalInstruction.replace("{{{_AI_ASSISTANT_}}}", 'Gemini'),
      features: {
         suitableFor: ['Data Analysis', 'Creative Writing', 'Code Generation', 'Image Understanding'],
         bestFor: ['Fast Responses', 'Visual Analysis', 'Interactive Coding'],
         specificFeatures: ['Vision Understanding', 'Code Generation', 'Real-Time Chat'],
      },
   }),

   // Perplexity Model
   createModelConfig({
      key: 'perplexity-mixtral',
      name: 'Perplexity',
      role: 'AI Based Search Engine',
      provider: 'perplexity',
      modelCodeName: 'llama-3.1-sonar-small-128k-online',
      categories: ['Internet Search'],
      instructions: searchEngineInstruction,
      description: 'Real-time search with concise, accurate responses and engaging presentation.',
      rating: 4.7,
      speed: 'Very Fast',
      isPro: true,
      isNew: true,
      features: {
         suitableFor: ['Data Analysis', 'Code Generation', 'Research'],
         bestFor: ['live real data', 'accurate', 'User-Friendly Explanations'],
         specificFeatures: ['High Performance', 'Technical Accuracy', 'Engaging Outputs'],
      },
   }),
];

// Utility functions
export const getModelByKey = (key) => AIPersonas.find(model => model.key === key);
export const getModelsByCategory = (category) => AIPersonas.filter(model => model.categories.includes(category));
export const getModelsByProvider = (provider) => AIPersonas.filter(model => model.provider === provider);
export const getAllModelKeys = () => AIPersonas.map(model => model.key);
export const getProModels = () => AIPersonas.filter(model => model.isPro);
export const getVisionModels = () => AIPersonas.filter(model => model.hasVision);