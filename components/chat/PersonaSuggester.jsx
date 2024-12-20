// components/chat/PersonaSuggester.jsx
import React, { useState, useEffect } from 'react';
import { AIPersonas } from '@/lib/Personas';
import { FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence, useCycle } from 'framer-motion';

const PersonaSuggester = ({ onSelect }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [step, setStep] = useState(1);
	const [responses, setResponses] = useState({
		useCase: '',
		responseType: '',
		specificFeatures: '',
	});
	const [suggestedPersonas, setSuggestedPersonas] = useState([]);

	// Animation cycle for the shape
	const [shape, cycleShape] = useCycle('circle', 'square', 'triangle');

	// Dynamic progress messages
	const progressMessages = {
		1: 'Only three questions to find the best solution for you.',
		2: 'Almost there, only two questions left.',
		3: 'We are finding the best solution, only one question left.',
		4: 'Finished! This is your list.',
	};

	// Toggle the suggester modal
	const toggleSuggester = () => {
		setIsOpen(!isOpen);
		if (!isOpen) {
			// Reset when opening
			setStep(1);
			setResponses({ useCase: '', responseType: '', specificFeatures: '' });
			setSuggestedPersonas([]);
		}
	};

	// Handle user responses
	const handleResponse = (e) => {
		const { name, value } = e.target;
		setResponses((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// Proceed to the next step
	const handleNext = () => {
		setStep((prev) => prev + 1);
	};

	// Go back to the previous step
	const handleBack = () => {
		setStep((prev) => prev - 1);
	};

	// Suggest personas based on responses
	const handleSuggest = () => {
		let recommendations = AIPersonas;

		// Filter by Primary Use-Case
		if (responses.useCase) {
			recommendations = recommendations.filter((persona) =>
				persona.features.suitableFor.includes(responses.useCase)
			);
		}

		// Filter by Response Type
		if (responses.responseType) {
			recommendations = recommendations.filter((persona) =>
				persona.features.bestFor.includes(responses.responseType)
			);
		}

		// Filter by Specific Features
		if (responses.specificFeatures) {
			recommendations = recommendations.filter((persona) =>
				persona.features.specificFeatures
					? persona.features.specificFeatures.includes(
							responses.specificFeatures
					  )
					: false
			);
		}

		// If no matches found, suggest 'o1-mini'
		if (recommendations.length === 0) {
			const o1Mini = AIPersonas.find(
				(persona) => persona.key === 'CHATGPT-o1-mini'
			);
			if (o1Mini) {
				recommendations = [o1Mini];
			}
		}

		setSuggestedPersonas(recommendations);
		setStep(4);
	};

	// Handle persona selection
	const handleSelectSuggestion = (persona) => {
		onSelect(persona);
		toggleSuggester();
	};

	// Shape animation interval
	useEffect(() => {
		if (isOpen) {
			const interval = setInterval(() => {
				cycleShape();
			}, 2000); // Change shape every 2 seconds

			return () => clearInterval(interval);
		}
	}, [isOpen, cycleShape]);

	return (
		<div className='mb-8'>
			{/* "Need Help?" Button */}
			<button
				onClick={toggleSuggester}
				className='px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-gray-500'>
				Need Help?
			</button>

			{/* Suggestion Modal */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={toggleSuggester} // Close modal when clicking on backdrop
					>
						<motion.div
							className='bg-white dark:bg-gray-800 rounded-lg w-full max-w-md h-full max-h-screen overflow-y-auto relative p-6 shadow-lg'
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.8, opacity: 0 }}
							transition={{ duration: 0.3 }}
							onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
						>
							{/* Animated Shape and Progress Text */}
							<div className='flex flex-col items-center mb-6'>
								{/* Animated Shape */}
								<motion.div
									className='w-16 h-16 bg-blue-500 rounded-full mb-4'
									animate={{
										borderRadius:
											shape === 'circle'
												? '50%'
												: shape === 'square'
												? '10%'
												: '0%',
										backgroundColor:
											shape === 'circle'
												? '#3B82F6' // Blue
												: shape === 'square'
												? '#10B981' // Green
												: '#F59E0B', // Yellow
									}}
									transition={{ duration: 1, ease: 'easeInOut' }}
								/>

								{/* Dynamic Progress Text */}
								<motion.p
									key={step}
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 10 }}
									transition={{ duration: 0.5 }}
									className='text-sm text-gray-500 dark:text-gray-400 text-center'>
									{progressMessages[step]}
								</motion.p>
							</div>

							{/* Suggester Content */}
							{step === 1 && (
								<motion.div
									key='step1'
									initial={{ x: 300, opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									exit={{ x: -300, opacity: 0 }}
									transition={{ duration: 0.5 }}>
									<h2 className='text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200'>
										1. What is your primary use-case?
									</h2>
									<div className='flex flex-col space-y-3'>
										<button
											name='useCase'
											value='Content Creation'
											onClick={(e) => {
												handleResponse(e);
												handleNext();
											}}
											className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-500'>
											Content Creation
										</button>
										<button
											name='useCase'
											value='Academic Research'
											onClick={(e) => {
												handleResponse(e);
												handleNext();
											}}
											className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-500'>
											Academic Research
										</button>
										<button
											name='useCase'
											value='Coding Assistance'
											onClick={(e) => {
												handleResponse(e);
												handleNext();
											}}
											className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-500'>
											Coding Assistance
										</button>
										<button
											name='useCase'
											value='Data Analysis'
											onClick={(e) => {
												handleResponse(e);
												handleNext();
											}}
											className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-500'>
											Data Analysis
										</button>
										<button
											name='useCase'
											value='Creative Projects'
											onClick={(e) => {
												handleResponse(e);
												handleNext();
											}}
											className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-500'>
											Creative Projects
										</button>
									</div>
								</motion.div>
							)}

							{step === 2 && (
								<motion.div
									key='step2'
									initial={{ x: 300, opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									exit={{ x: -300, opacity: 0 }}
									transition={{ duration: 0.5 }}>
									<h2 className='text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200'>
										2. What type of responses do you prefer?
									</h2>
									<p className='text-sm text-gray-500 dark:text-gray-400 mb-4'>
										Almost there, only two questions left.
									</p>
									<div className='flex flex-col space-y-3'>
										<button
											name='responseType'
											value='Detailed Explanations'
											onClick={(e) => {
												handleResponse(e);
												handleNext();
											}}
											className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-500'>
											Detailed Explanations
										</button>
										<button
											name='responseType'
											value='Concise Summaries'
											onClick={(e) => {
												handleResponse(e);
												handleNext();
											}}
											className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-500'>
											Concise Summaries
										</button>
										<button
											name='responseType'
											value='Code Snippets'
											onClick={(e) => {
												handleResponse(e);
												handleNext();
											}}
											className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-500'>
											Code Snippets
										</button>
										<button
											name='responseType'
											value='Visual Aids'
											onClick={(e) => {
												handleResponse(e);
												handleNext();
											}}
											className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-500'>
											Visual Aids
										</button>
										<button
											name='responseType'
											value='Interactive Assistance'
											onClick={(e) => {
												handleResponse(e);
												handleNext();
											}}
											className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-500'>
											Interactive Assistance
										</button>
									</div>
									{/* Back Button */}
									<button
										onClick={handleBack}
										className='mt-4 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition focus:outline-none focus:ring-2 focus:ring-gray-500'>
										Back
									</button>
								</motion.div>
							)}

							{step === 3 && (
								<motion.div
									key='step3'
									initial={{ x: 300, opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									exit={{ x: -300, opacity: 0 }}
									transition={{ duration: 0.5 }}>
									<h2 className='text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200'>
										3. Do you require any specific features?
									</h2>
									<p className='text-sm text-gray-500 dark:text-gray-400 mb-4'>
										We are finding the best solution, only one question left.
									</p>
									<div className='flex flex-col space-y-3'>
										<button
											name='specificFeatures'
											value='Language Support'
											onClick={(e) => {
												handleResponse(e);
												handleSuggest();
											}}
											className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-500'>
											Language Support
										</button>
										<button
											name='specificFeatures'
											value='Integration Capabilities'
											onClick={(e) => {
												handleResponse(e);
												handleSuggest();
											}}
											className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-500'>
											Integration Capabilities
										</button>
										<button
											name='specificFeatures'
											value='Customization'
											onClick={(e) => {
												handleResponse(e);
												handleSuggest();
											}}
											className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-500'>
											Customization
										</button>
										<button
											name='specificFeatures'
											value='Real-Time Collaboration'
											onClick={(e) => {
												handleResponse(e);
												handleSuggest();
											}}
											className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-500'>
											Real-Time Collaboration
										</button>
										<button
											name='specificFeatures'
											value='Security Features'
											onClick={(e) => {
												handleResponse(e);
												handleSuggest();
											}}
											className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-500'>
											Security Features
										</button>
									</div>
									{/* Back Button */}
									<button
										onClick={handleBack}
										className='mt-4 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition focus:outline-none focus:ring-2 focus:ring-gray-500'>
										Back
									</button>
								</motion.div>
							)}

							{step === 4 && (
								<motion.div
									key='step4'
									initial={{ x: 300, opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									exit={{ x: -300, opacity: 0 }}
									transition={{ duration: 0.5 }}>
									<h2 className='text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200'>
										Completed! Here are your recommended personas:
									</h2>
									<p className='text-sm text-gray-500 dark:text-gray-400 mb-4 text-center'>
										Finished! This is your list.
									</p>
									{suggestedPersonas.length > 0 ? (
										<div className='space-y-4 max-h-64 overflow-y-auto'>
											{suggestedPersonas.map((persona) => (
												<div
													key={persona.key}
													onClick={() => handleSelectSuggestion(persona)}
													className='flex items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition'>
													<img
														src={persona.avatar || '/images/default-avatar.jpg'}
														alt={`${persona.name} avatar`}
														className='w-12 h-12 rounded-full object-cover mr-4'
														onError={(e) => {
															e.target.src = '/images/default-avatar.jpg';
														}}
													/>
													<div>
														<h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>
															{persona.name}
														</h3>
														<p className='text-sm text-gray-600 dark:text-gray-300'>
															{persona.description}
														</p>
													</div>
												</div>
											))}
										</div>
									) : (
										<p className='text-gray-500 dark:text-gray-400 text-center'>
											No suitable personas found.
										</p>
									)}
									{/* Reset Button */}
									<button
										onClick={() => setStep(1)}
										className='mt-6 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-gray-500'>
										Choose Again
									</button>
								</motion.div>
							)}
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default PersonaSuggester;
