'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
	FaGlobe,
	FaLightbulb,
	FaUserFriends,
	FaBolt,
	FaLock,
	FaUserShield,
} from 'react-icons/fa';
import { SiOpenai } from 'react-icons/si';
import { MdSecurity } from 'react-icons/md';

const WelcomePage = () => {
	const router = useRouter();

	const handleGetStarted = () => {
		// Navigate user to the chat page where they can pick a model
		router.push('/chat');
	};

	return (
		<div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-8'>
			<div className='w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 md:p-10 my-8'>
				<div className='space-y-6'>
					{/* Header */}
					<div className='text-center space-y-3'>
						<h1 className='text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100'>
							Welcome to <span className='text-blue-600'>BabaGPT</span>
						</h1>
						<p className='text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed'>
							Your All-in-One AI Hub, where you can seamlessly interact with
							various AI models to write, research, analyze, and create—all in
							one place.
						</p>
					</div>

					{/* Why Choose BabaGPT */}
					<div className='space-y-4'>
						<h2 className='text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2'>
							<FaLightbulb className='text-yellow-500' /> Why Choose BabaGPT?
						</h2>
						<ul className='list-disc list-inside text-gray-700 dark:text-gray-300 text-sm space-y-2'>
							<li>
								<FaUserShield className='inline-block text-blue-500 mr-2' />{' '}
								<strong>Privacy & Security:</strong> Your data is treated with
								utmost care and never shared without permission.
							</li>
							<li>
								<FaLock className='inline-block text-blue-500 mr-2' />{' '}
								<strong>Cost-Effective:</strong> Access premium AI models at
								better rates, saving you resources.
							</li>
							<li>
								<FaBolt className='inline-block text-blue-500 mr-2' />{' '}
								<strong>Unified Platform:</strong> Multiple cutting-edge AI
								models available under one roof—no need to switch between
								services.
							</li>
							<li>
								<FaUserFriends className='inline-block text-blue-500 mr-2' />{' '}
								<strong>Easy Collaboration:</strong> Work together on projects,
								share insights, and refine your prompts.
							</li>
						</ul>
					</div>

					{/* Available AI Models */}
					<div className='space-y-4'>
						<h2 className='text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2'>
							<FaGlobe className='text-green-500' /> Meet Our AI Models
						</h2>
						<div className='space-y-3 text-gray-700 dark:text-gray-300 text-sm leading-relaxed'>
							<p>
								We carefully selected and integrated several top-tier models:
							</p>
							<ul className='list-disc list-inside space-y-2'>
								<li>
									<SiOpenai className='inline-block text-green-600 mr-2' />{' '}
									<strong>OpenAI Models (e.g., ChatGPT 4o):</strong> Perfect for
									long-form, creative content, coding assistance, and complex
									reasoning.
								</li>
								<li>
									<img
										src='/images/personas/claude.webp'
										alt='Claude Avatar'
										className='w-5 h-5 inline-block mr-2 rounded-full align-middle'
									/>{' '}
									<strong>Claude (Anthropic):</strong> Ideal for data-driven
									tasks, research, and elaborate explanations with a focus on
									accuracy and clarity.
								</li>
								<li>
									<FaGlobe className='inline-block text-blue-600 mr-2' />{' '}
									<strong>Perplexity:</strong> A live AI-based search model that
									excels in quick, real-time information retrieval and analysis.
								</li>
							</ul>
						</div>
					</div>

					{/* How to Use BabaGPT */}
					<div className='space-y-4'>
						<h2 className='text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2'>
							<MdSecurity className='text-purple-500' /> How to Use BabaGPT
						</h2>
						<div className='text-gray-700 dark:text-gray-300 text-sm leading-relaxed space-y-2'>
							<p>Getting started is easy:</p>
							<ol className='list-decimal list-inside space-y-1'>
								<li>
									<strong>Select Your Model:</strong> After clicking the button
									below, you’ll be guided to choose from one of the available AI
									models.
								</li>
								<li>
									<strong>Ask Your Question or State Your Task:</strong> Whether
									it’s writing content, coding, or conducting research—just
									provide a prompt.
								</li>
								<li>
									<strong>Refine & Explore:</strong> Follow up with more
									queries, refine your prompts, or switch models anytime. The
									conversation history helps keep track of progress.
								</li>
							</ol>
							<p>
								From drafting articles and summarizing research papers to
								brainstorming creative ideas and debugging code, BabaGPT is
								versatile enough to handle it all.
							</p>
						</div>
					</div>

					{/* Call-to-Action */}
					<div className='text-center'>
						<button
							onClick={handleGetStarted}
							className='inline-block w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors'>
							Let’s Start!
						</button>
						<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
							Click the button above to choose your AI model and begin.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default WelcomePage;
