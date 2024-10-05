// Chat.js
import React from 'react';
import Header from './Header';
import ChatInterface from './ChatInterface';

const Chat = () => {
	return (
		<div className='min-h-screen '>
			<div className='max-w-3xl mx-auto rounded-xl overflow-hidden no-scrollbar'>
				<div className='h-[calc(100vh-3rem)] md:h-[calc(100vh-4rem)] flex flex-col overflow-hidden'>
					<Header />
					<ChatInterface />
				</div>
			</div>
		</div>
	);
};

export default Chat;
