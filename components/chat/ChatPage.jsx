'use client';
import React from 'react';
import ModelSelection from './ModelSelection';
import Loading from '../Loading';
import { useAuth } from '@/context/AuthContext';
import Chat from './Chat';
import { useChat } from '@/context/ChatContext';

const ChatPage = () => {
	const { handleModelSelect, isLoading } = useChat();
	const { user } = useAuth();

	if (!user || isLoading) {
		return <Loading />;
	}

	return (
		<div className='flex flex-col no-scrollbar'>
			<ModelSelection onSelect={handleModelSelect} />
		</div>
	);
};

export default ChatPage;
