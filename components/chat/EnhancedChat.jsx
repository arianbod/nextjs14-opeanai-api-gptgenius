import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import ModelSelection from './ModelSelection';
import ChatInterface from './ChatInterface';
import ImageGenerationInterface from './ImageGenerationInterface';
import Header from './Header';
import ShowTokenAmount from '../token/ShowTokenAmount';

const EnhancedChat = () => {
	const { isLoaded, isSignedIn } = useUser();
	const [selectedPersona, setSelectedPersona] = useState(null);

	if (!isLoaded) {
		return <div>Loading...</div>;
	}

	if (!isSignedIn) {
		return <div>Please sign in to use the chat.</div>;
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900'>
			<div className='max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden'>
				{!selectedPersona ? (
					<>
					
						<ModelSelection onSelect={setSelectedPersona} />
					</>
				) : (
					<div className='h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] flex flex-col'>
						<Header
							selectedPersona={selectedPersona}
							onChangeModel={() => setSelectedPersona(null)}
						/>

						{selectedPersona.name === 'DALL-E' ? (
							<ImageGenerationInterface />
						) : (
							<ChatInterface persona={selectedPersona} />
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default EnhancedChat;
