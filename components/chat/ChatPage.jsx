// components/chat/ChatPage.js
'use client';
import React from 'react';
import ModelSelection from './ModelSelection';
import Chat from './Chat';
import Loading from '../Loading';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';

const ChatPage = () => {
	const { activeChat } = useChat();
	const { user } = useAuth();

	if (!user) {
		return <Loading />;
	}

	// If a model has been selected, render the Chat interface
	if (activeChat.provider && activeChat.modelCodeName) {
		return <Chat />;
	}

	// Otherwise, show the ModelSelection component
	return (
		<div className='flex flex-col no-scrollbar'>
			<ModelSelection />
		</div>
	);
};

export default ChatPage;
