'use client';
import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import Loading from '../Loading';
import Chat from '../chat/Chat';
import { FIRST_TIME_USER_CONFIG } from '@/lib/Personas';

const WelcomePage = () => {
	const { user } = useAuth();
	const {
		activeChat,
		isLoading,
		handleModelSelect,
		chatList,
		addMessage,
		model,
		messages,
	} = useChat();

	const welcomeSent = useRef(false);

	useEffect(() => {
		const initializeWelcomeChat = async () => {
			if (!model) {
				handleModelSelect(FIRST_TIME_USER_CONFIG);
			}
		};

		if (user?.userId && !isLoading && !model) {
			initializeWelcomeChat();
		}
	}, [user?.userId, isLoading, model, handleModelSelect]);

	useEffect(() => {
		if (model && !welcomeSent.current && messages.length === 0 && !isLoading) {
			welcomeSent.current = true;

			const welcomeMessage = `# 👋 Welcome to BabaGPT - Your All-in-One AI Hub!

## 🤖 I'm Claude, Your Personal AI Guide

I'm excited to introduce you to BabaGPT, where you'll find all your AI solutions in one place:

### ✨ Why Choose BabaGPT?
- 🔐 **Enhanced Privacy**: Your data stays secure and private
- 💎 **Cost-Effective**: Access premium AI models at better prices
- 🎯 **Unified Platform**: Multiple AI models in one place
- ⚡ **Seamless Integration**: Switch between models effortlessly

### 🌟 Available AI Models:
- **OpenAI**: ChatGPT 4, GPT-3.5, and more
- **Anthropic**: Claude and other advanced models
- **Perplexity**: For real-time analysis
- **Additional Models**: Constantly expanding our offerings

### 💡 What Can We Create Together?
- ✍️ **Writing & Content Creation**
  - Documents, articles, stories
  - Marketing copy, emails, reports
  
- 🔍 **Analysis & Research**
  - Data analysis and visualization
  - Market research and insights
  
- 💻 **Technical Solutions**
  - Code development and debugging
  - Technical documentation
  
- 🎨 **Creative Projects**
  - Brainstorming and ideation
  - Creative writing and design concepts

### 🚀 Ready to Start?
Let me know what interests you most, and I'll help you:
- Explore different AI models
- Find the perfect solution for your needs
- Get started with your first project

What would you like to explore first? 💫`;

			addMessage({
				id: 'welcome-message',
				role: 'assistant',
				content: welcomeMessage,
				timestamp: new Date().toISOString(),
			});
		}
	}, [model, messages.length, isLoading, addMessage]);

	if (!user || isLoading) {
		return <Loading />;
	}

	return <Chat />;
};

export default WelcomePage;
