// components/chat/Chat.js
import React from 'react';
import Header from './Header';
import ChatInterface from './ChatInterface';
import { useTranslations } from '@/context/TranslationContext';

const Chat = ({ lang }) => {
	const dict = useTranslations();

	return (
		<div className='min-h-screen w-full'>
			<div className='w-full max-w-3xl mx-auto rounded-xl no-scrollbar'>
				<div className='h-[calc(100vh-3rem)] md:h-[calc(100vh-4rem)] flex flex-col'>
					
					<ChatInterface
						lang={lang}
						dict={dict}
					/>
				</div>
			</div>
		</div>
	);
};

export default Chat;
