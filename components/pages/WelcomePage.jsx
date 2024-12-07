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
} from 'react-icons/fa';
import { SiOpenai } from 'react-icons/si';
import { MdSecurity } from 'react-icons/md';

const WelcomePage = () => {
	const router = useRouter();

	const handleGetStarted = () => {
		router.push('/chat');
	};

	return (
		<div className='min-h-screen flex flex-col bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800'>
			{/* Hero Section */}
			<header className='relative flex flex-col items-center text-center px-4 pt-16 pb-10'>
			
				<h1 className='text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-50 leading-tight animate-[fadeInUp_0.8s_ease-in-out]'>
					Welcome to{' '}
					<span className='text-blue-600 dark:text-blue-400'>BabaGPT</span>
				</h1>
				<p className='max-w-2xl mx-auto text-gray-600 dark:text-gray-300 mt-4 text-base md:text-lg leading-relaxed animate-[fadeInUp_1s_ease-in-out]'>
					Your all-in-one hub for accessing top-tier AI models to write, create,
					and explore.
				</p>
			</header>

			{/* Content Section */}
			<main className='flex-1 px-4 pb-10'>
				<div className='max-w-3xl mx-auto space-y-12'>
					{/* Why Choose BabaGPT */}
					<section className='space-y-5'>
						<h2 className='text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-50 flex items-center justify-center gap-2'>
							<FaLightbulb className='text-yellow-500 transition-transform duration-300 group-hover:scale-110' />
							Why Choose BabaGPT?
						</h2>
						<ul className='space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed'>
							<li className='flex items-start gap-3'>
								<FaUserShield className='text-blue-500 w-5 h-5 mt-0.5' />
								<span>
									<strong>Privacy & Security:</strong> Your data is safe, never
									shared without permission.
								</span>
							</li>
							<li className='flex items-start gap-3'>
								<FaLock className='text-blue-500 w-5 h-5 mt-0.5' />
								<span>
									<strong>Cost-Effective:</strong> Access premium AI models at
									more affordable rates.
								</span>
							</li>
							<li className='flex items-start gap-3'>
								<FaBolt className='text-blue-500 w-5 h-5 mt-0.5' />
								<span>
									<strong>Unified Platform:</strong> No need to switch
									services—multiple AI models under one roof.
								</span>
							</li>
							<li className='flex items-start gap-3'>
								<FaUserFriends className='text-blue-500 w-5 h-5 mt-0.5' />
								<span>
									<strong>Easy Collaboration:</strong> Work together, share
									insights, and refine prompts as a team.
								</span>
							</li>
						</ul>
					</section>

					{/* Available AI Models */}
					<section className='space-y-5'>
						<h2 className='text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-50 flex items-center justify-center gap-2'>
							<FaGlobe className='text-green-500 transition-transform duration-300 group-hover:scale-110' />
							Meet Our AI Models
						</h2>
						<div className='text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed space-y-3'>
							<p>We offer several advanced models to suit your every need:</p>
							<ul className='space-y-3'>
								<li className='flex items-start gap-3'>
									<SiOpenai className='text-green-600 w-5 h-5 mt-0.5' />
									<span>
										<strong>OpenAI (e.g., ChatGPT 4o):</strong> Ideal for
										creative writing, complex reasoning, and coding assistance.
									</span>
								</li>
								<li className='flex items-start gap-3'>
									<img
										src='/images/personas/claude.webp'
										alt='Claude Avatar'
										className='w-5 h-5 rounded-full mt-0.5'
									/>
									<span>
										<strong>Claude (Anthropic):</strong> Excellent for
										data-driven tasks, research, and in-depth explanations.
									</span>
								</li>
								<li className='flex items-start gap-3'>
									<FaGlobe className='text-blue-600 w-5 h-5 mt-0.5' />
									<span>
										<strong>Perplexity:</strong> A live AI search engine for
										real-time information, quick research, and fast analysis.
									</span>
								</li>
							</ul>
						</div>
					</section>

					{/* How to Use */}
					<section className='space-y-5'>
						<h2 className='text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-50 flex items-center justify-center gap-2'>
							<MdSecurity className='text-purple-500 transition-transform duration-300 group-hover:scale-110' />
							How to Use BabaGPT
						</h2>
						<div className='text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed space-y-4'>
							<p>
								<strong>It’s simple:</strong>
							</p>
							<ol className='list-decimal list-inside space-y-2 ml-4'>
								<li>
									<strong>Pick Your Model:</strong> After starting, choose the
									AI model that best fits your needs.
								</li>
								<li>
									<strong>Ask or Create:</strong> Pose a question, give a task,
									request code help, or brainstorm ideas.
								</li>
								<li>
									<strong>Refine & Iterate:</strong> Improve your prompts,
									request follow-ups, or switch models as you go.
								</li>
							</ol>
							<p>
								From drafting articles and summarizing research, to
								brainstorming fresh concepts or debugging code, BabaGPT empowers
								you to achieve more—faster and smarter.
							</p>
						</div>
					</section>

					{/* CTA */}
					<section className='text-center pt-6'>
						<button
							onClick={handleGetStarted}
							className='inline-block px-8 py-3 text-sm md:text-base font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform transform hover:-translate-y-0.5'>
							Let’s Start!
						</button>
						<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
							Click the button above to select your model and begin your
							journey.
						</p>
					</section>
				</div>
			</main>
		</div>
	);
};

export default WelcomePage;
