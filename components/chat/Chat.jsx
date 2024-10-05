// Chat.js
import React from 'react';
import Header from './Header';
import ChatInterface from './ChatInterface';

const Chat = () => {
	return (
		<div className='min-h-screen w-full'>
			<div className='w-full max-w-3xl mx-auto rounded-xl no-scrollbar'>
				<div className='h-[calc(100vh-3rem)] md:h-[calc(100vh-4rem)] flex flex-col'>
					<Header />
					<ChatInterface />
				</div>
			</div>
		</div>
	);
};

export default Chat;
