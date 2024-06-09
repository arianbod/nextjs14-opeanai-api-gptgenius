'use client';
import { generateChatResponse } from '@/utils/action';
import { useMutation } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { IoMdSend } from 'react-icons/io';
import { FaUserLarge } from 'react-icons/fa6';
import { BsChatRightText } from 'react-icons/bs';
import { useAuth } from '@clerk/nextjs';
import GetFirstname from './getFirstname';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark as darkStyle } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getTextDirection } from '@/utils/utils';

const Chat = () => {
	const { userId } = useAuth();
	const [text, setText] = useState('');
	const [messages, setMessages] = useState([]);
	const messagesEndRef = useRef(null); // Ref for the container's bottom
	const { mutate, isPending } = useMutation({
		mutationFn: async (query) => {
			const response = await generateChatResponse([...messages, query]);
			if (!response) {
				toast.error('there is no data');
				return;
			}
			setMessages((prev) => [...prev, response.message]);
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		const query = { role: 'user', content: text };
		mutate(query);
		setMessages((prev) => [...prev, query]);
		setText('');
	};

	useEffect(() => {
		// Scroll to the bottom of the messages container
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]); // Dependency array ensures effect runs when messages change

	const renderers = {
		code({ node, inline, className, children, ...props }) {
			const match = /language-(\w+)/.exec(className || '');
			return !inline && match ? (
				<SyntaxHighlighter
					style={darkStyle}
					language={match[1]}
					PreTag='div'
					{...props}>
					{String(children).replace(/\n$/, '')}
				</SyntaxHighlighter>
			) : (
				<code
					className={className}
					{...props}>
					{children}
				</code>
			);
		},
	};

	return (
		<div className='min-h-[calc(100vh)] grid grid-rows-[1fr,auto] -mx-8 dark:bg-gray-900 dark:text-gray-100'>
			<div className='max-h-[calc(100vh-11rem)] overflow-y-auto overflow-x-hidden'>
				<ul>
					<GetFirstname />
					{messages.map(({ role, content }, index) => {
						const id = nanoid();
						const directionClass = getTextDirection(content);
						return (
							<li
								key={id}
								className={`flex items-baseline gap-3 py-6 px-4 text-lg leading-loose border-b border-gray-300 ${
									role === 'assistant'
										? 'bg-gray-100 dark:bg-gray-800 px-12'
										: ''
								} ${directionClass}`}>
								<span className='flex-shrink-0'>
									{role === 'user' && <FaUserLarge />}
									{role === 'assistant' && <BsChatRightText />}
								</span>
								<div className='max-w-3xl'>
									<ReactMarkdown components={renderers}>
										{content}
									</ReactMarkdown>
								</div>
								{isPending && messages.length === index + 1 && (
									<span className='loading'></span>
								)}
							</li>
						);
					})}
					<div ref={messagesEndRef} />
					{/* Invisible element at the end of the messages */}
				</ul>
			</div>
			<form
				onSubmit={handleSubmit}
				className='max-w-4xl px-8 pt-12'>
				<div className='flex w-full'>
					<input
						type='text'
						placeholder='text me here 😎'
						className='flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring focus:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500'
						value={text}
						onChange={(e) => {
							setText(e.target.value);
						}}
					/>
					<button
						className='px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring focus:bg-blue-700'
						type='submit'
						disabled={isPending}>
						{isPending ? 'Wait...' : <IoMdSend />}
					</button>
				</div>
			</form>
		</div>
	);
};

export default Chat;
