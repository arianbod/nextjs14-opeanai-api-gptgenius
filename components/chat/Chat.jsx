// components/chat/Chat.js
import React from 'react';
import Header from './Header';
import ChatInterface from './ChatInterface';
import { useTranslations } from '@/context/TranslationContext';

const Chat = ({ lang }) => {
	const dict = useTranslations();

	return (
		
			
					<ChatInterface
						lang={lang}
						dict={dict}
					/>			
		
		
	);
};

export default Chat;
