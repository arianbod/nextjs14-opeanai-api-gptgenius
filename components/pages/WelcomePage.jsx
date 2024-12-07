'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
	FaLightbulb,
	FaUserShield,
	FaLock,
	FaBolt,
	FaUserFriends,
	FaGlobe,
	FaRocket,
	FaRegLightbulb,
	FaRegComments,
} from 'react-icons/fa';
import { SiOpenai } from 'react-icons/si';
import { MdSecurity, MdTipsAndUpdates } from 'react-icons/md';

const WelcomePage = () => {
	const router = useRouter();

	const handleGetStarted = () => {
		router.push('/chat');
	};

	return (
		<div className='min-h-screen flex flex-col bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800'>
			{/* Hero Section with Animation */}
			<header className='relative flex flex-col items-center text-center px-4 pt-16 pb-10'>
				<div className='absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none'>
					<div className='absolute w-64 h-64 bg-blue-400/10 rounded-full -top-32 -left-32 animate-pulse'></div>
					<div className='absolute w-64 h-64 bg-purple-400/10 rounded-full -bottom-32 -right-32 animate-pulse delay-700'></div>
				</div>

				<div className='relative'>
					<h1 className='text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-50 leading-tight animate-[fadeInUp_0.8s_ease-in-out]'>
						Welcome to{' '}
						<span className='bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400'>
							BabaGPT
						</span>
					</h1>
					<div className='mt-6 flex flex-col items-center space-y-4'>
						<p className='max-w-2xl text-gray-600 dark:text-gray-300 text-lg md:text-xl leading-relaxed animate-[fadeInUp_1s_ease-in-out]'>
							Your friendly AI companion for writing, learning, and exploring—no
							expertise needed! ✨
						</p>
						<div className='flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400'>
							<FaRegLightbulb className='animate-bounce' />
							<span>Get answers & ideas instantly</span>
						</div>
					</div>
				</div>
			</header>

			{/* Quick Start Guide */}
			<div className='max-w-3xl mx-auto px-4 py-8'>
				<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-12'>
					<h2 className='text-xl font-bold text-gray-800 dark:text-gray-50 mb-4 flex items-center gap-2'>
						<MdTipsAndUpdates className='text-yellow-500' />
						Quick Start Guide
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-center'>
						<div className='p-4 rounded-lg bg-blue-50 dark:bg-gray-700'>
							<div className='text-blue-600 dark:text-blue-400 font-semibold mb-2'>
								1. Pick a Model
							</div>
							<p className='text-sm text-gray-600 dark:text-gray-300'>
								Choose an AI assistant that fits your goal
							</p>
						</div>
						<div className='p-4 rounded-lg bg-purple-50 dark:bg-gray-700'>
							<div className='text-purple-600 dark:text-purple-400 font-semibold mb-2'>
								2. Ask or Create
							</div>
							<p className='text-sm text-gray-600 dark:text-gray-300'>
								Describe what you need—questions, drafts, code
							</p>
						</div>
						<div className='p-4 rounded-lg bg-green-50 dark:bg-gray-700'>
							<div className='text-green-600 dark:text-green-400 font-semibold mb-2'>
								3. Get Results
							</div>
							<p className='text-sm text-gray-600 dark:text-gray-300'>
								See instant suggestions & refine if needed
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<main className='flex-1 px-4 pb-10'>
				<div className='max-w-3xl mx-auto space-y-12'>
					{/* Why Choose BabaGPT */}
					<section className='space-y-6'>
						<h2 className='text-2xl font-bold text-gray-800 dark:text-gray-50 flex items-center justify-center gap-2'>
							<FaLightbulb className='text-yellow-500' />
							Why BabaGPT?
						</h2>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div className='p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow'>
								<div className='flex items-start gap-3'>
									<FaUserShield className='text-blue-500 w-6 h-6' />
									<div>
										<h3 className='font-semibold mb-2'>Safe & Private</h3>
										<p className='text-sm text-gray-600 dark:text-gray-300'>
											Your data is secure and confidential
										</p>
									</div>
								</div>
							</div>
							<div className='p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow'>
								<div className='flex items-start gap-3'>
									<FaLock className='text-green-500 w-6 h-6' />
									<div>
										<h3 className='font-semibold mb-2'>Budget-Friendly</h3>
										<p className='text-sm text-gray-600 dark:text-gray-300'>
											Top-tier AI without the premium price tag
										</p>
									</div>
								</div>
							</div>
							<div className='p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow'>
								<div className='flex items-start gap-3'>
									<FaBolt className='text-yellow-500 w-6 h-6' />
									<div>
										<h3 className='font-semibold mb-2'>All-in-One Hub</h3>
										<p className='text-sm text-gray-600 dark:text-gray-300'>
											No need to hop between different tools
										</p>
									</div>
								</div>
							</div>
							<div className='p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow'>
								<div className='flex items-start gap-3'>
									<FaUserFriends className='text-purple-500 w-6 h-6' />
									<div>
										<h3 className='font-semibold mb-2'>Beginner-Friendly</h3>
										<p className='text-sm text-gray-600 dark:text-gray-300'>
											Easy to use, no expertise needed
										</p>
									</div>
								</div>
							</div>
						</div>
					</section>

					{/* Our AI Models */}
					<section className='space-y-6'>
						<h2 className='text-2xl font-bold text-gray-800 dark:text-gray-50 flex items-center justify-center gap-2'>
							<FaGlobe className='text-green-500' />
							Meet the AI Assistants
						</h2>
						<div className='grid grid-cols-1 gap-4'>
							<div className='p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow'>
								<div className='flex items-center gap-4'>
									<div className='w-12 h-12 flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 rounded-xl'>
										<SiOpenai className='w-6 h-6 text-white' />
									</div>
									<div>
										<h3 className='font-semibold mb-1'>ChatGPT (OpenAI)</h3>
										<p className='text-sm text-gray-600 dark:text-gray-300'>
											For writing drafts, asking questions, and coding help
										</p>
									</div>
								</div>
							</div>
							<div className='p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow'>
								<div className='flex items-center gap-4'>
									<div className='w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl'>
										<img
											src='/images/personas/claude.webp'
											alt='Claude'
											className='w-8 h-8 rounded-lg'
										/>
									</div>
									<div>
										<h3 className='font-semibold mb-1'>Claude (Anthropic)</h3>
										<p className='text-sm text-gray-600 dark:text-gray-300'>
											Ideal for research summaries & deep insights
										</p>
									</div>
								</div>
							</div>
							<div className='p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow'>
								<div className='flex items-center gap-4'>
									<div className='w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl'>
										<FaGlobe className='w-6 h-6 text-white' />
									</div>
									<div>
										<h3 className='font-semibold mb-1'>Perplexity</h3>
										<p className='text-sm text-gray-600 dark:text-gray-300'>
											For real-time info and quick answers
										</p>
									</div>
								</div>
							</div>
						</div>
					</section>

					{/* Examples Section */}
					<section className='space-y-6'>
						<h2 className='text-2xl font-bold text-gray-800 dark:text-gray-50 flex items-center justify-center gap-2'>
							<FaRegComments className='text-purple-500' />
							Try These Examples!
						</h2>
						<div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6'>
							<div className='space-y-4'>
								<div className='flex items-start gap-3'>
									<div className='w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-full'>
										<span className='text-xs text-blue-600 dark:text-blue-400'>
											1
										</span>
									</div>
									<div>
										<p className='text-sm'>
											"Help me write an email to my boss explaining a new idea"
										</p>
									</div>
								</div>
								<div className='flex items-start gap-3'>
									<div className='w-6 h-6 flex items-center justify-center bg-purple-100 dark:bg-purple-900 rounded-full'>
										<span className='text-xs text-purple-600 dark:text-purple-400'>
											2
										</span>
									</div>
									<div>
										<p className='text-sm'>
											"Summarize this article in plain English"
										</p>
									</div>
								</div>
								<div className='flex items-start gap-3'>
									<div className='w-6 h-6 flex items-center justify-center bg-green-100 dark:bg-green-900 rounded-full'>
										<span className='text-xs text-green-600 dark:text-green-400'>
											3
										</span>
									</div>
									<div>
										<p className='text-sm'>
											"Check my Python code for mistakes"
										</p>
									</div>
								</div>
							</div>
						</div>
					</section>

					{/* CTA Section */}
					<section className='text-center pt-6'>
						<div className='bg-gradient-to-r from-blue-500 to-purple-500 p-8 rounded-2xl shadow-lg relative overflow-hidden'>
							<h3 className='text-2xl font-bold text-white mb-4'>
								Ready to Begin?
							</h3>
							<p className='text-white/90 mb-6'>
								Start exploring all that BabaGPT has to offer.
							</p>
							<button
								onClick={handleGetStarted}
								className='inline-flex items-center px-8 py-3 text-lg font-medium bg-white text-blue-600 rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500 transition-all transform hover:-translate-y-0.5'>
								<FaRocket className='mr-2' />
								Let's Go!
							</button>

							{/* Optional subtle decorative element */}
							<div className='absolute right-0 bottom-0 w-24 h-24 bg-white/20 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2'></div>
						</div>
					</section>
				</div>
			</main>
		</div>
	);
};

export default WelcomePage;
