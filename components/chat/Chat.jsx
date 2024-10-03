import React from 'react';
import Header from './Header';
import ChatInterface from './ChatInterface';

const Chat = ({
	user,
	selectedPersona,
	handleChangeModel,
	chatId,
	chatData,
}) => {
	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900'>
			<div className='max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl overflow-hidden no-scrollbar'>
				<div className='h-[calc(100vh-3rem)] md:h-[calc(100vh-4rem)] flex flex-col overflow-hidden'>
					<Header
						selectedPersona={selectedPersona}
						onChangeModel={handleChangeModel}
					/>

					{chatData.model.name === 'DALL-E' ? (
						<ImageGenerationInterface
							userId={user.userId}
							chatId={chatId.toString()}
						/>
					) : (
						<ChatInterface
							userId={user.userId}
							persona={chatData.model}
							chatId={chatId.toString()}
							initialMessages={chatData.messages}
							isPerplexity={chatData.model.engine === 'Perplexity'}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default Chat;
