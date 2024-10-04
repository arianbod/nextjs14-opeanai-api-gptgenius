// import React from 'react';
// import Header from './Header';
// import ChatInterface from './ChatInterface';
// import { useChat } from '@/context/ChatContext';

// const Chat = ({ user }) => {
// 	const { messages, model } = useChat();
// 	const { activeChat } = useChat();
// 	const chatId = activeChat.id;
// 	return (
// 		<div className='min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900'>
// 			<div className='max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl overflow-hidden no-scrollbar'>
// 				<div className='h-[calc(100vh-3rem)] md:h-[calc(100vh-4rem)] flex flex-col overflow-hidden'>
// 					<Header />

// 					{/* {activeChat.engineCodeName === 'DALL-E' ? (
// 						<ImageGenerationInterface
// 							userId={user.userId}
// 							chatId={chatId.toString()}
// 						/>
// 					) : (
// 						)}
// 					  */}
// 					<ChatInterface
// 						userId={user.userId}
// 						persona={chatData.model}
// 						chatId={chatId.toString()}
// 						initialMessages={chatData.messages}
// 						isPerplexity={chatData.model.engine === 'Perplexity'}
// 					/>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export default Chat;

import React from 'react';
import Header from './Header';
import ChatInterface from './ChatInterface';
import { useChat } from '@/context/ChatContext';

const Chat = () => {
	const { activeChat } = useChat();

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
