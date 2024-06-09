'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import toast from 'react-hot-toast';
import { IoMdSend } from 'react-icons/io';
import { FaUserLarge } from 'react-icons/fa6';
import { BsChatRightText } from 'react-icons/bs';
import { useAuth } from '@clerk/nextjs';
import GetFirstname from './getFirstname';
import MarkdownComponent from './MarkdownComponent';
import {
	fetchUserTokensById,
	generateChatResponse,
	subtractTokens,
} from '@/utils/action';

const Chat = () => {
	const { userId } = useAuth();
	const [text, setText] = useState('');
	const [messages, setMessages] = useState([]);
	const messagesEndRef = useRef(null); // Ref for the container's bottom
	const { mutate, isPending } = useMutation({
		mutationFn: async (query) => {
			const currentTokens = await fetchUserTokensById(userId);
			if (currentTokens <= 100) {
				toast.error('Token balance is insufficient');
				return;
			}
			const response = await generateChatResponse([...messages, query]);
			if (!response) {
				toast.error('There is no data');
				return;
			}
			setMessages((prev) => [...prev, response.message]);
			const newToken = await subtractTokens(userId, response.tokens);
			toast.success(`${newToken} remaining tokens`);
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

	return (
		<div className='min-h-[calc(100vh-6rem)] grid grid-rows-[1fr,auto] -mx-8'>
			<div className='max-h-[calc(100vh-12rem)] overflow-y-auto overflow-x-hidden'>
				<ul>
					<GetFirstname />
					{messages.map(({ role, content }, index) => {
						const id = nanoid();
						return (
							<li
								key={id}
								className={`chat-message flex items-baseline gap-3 py-6 px-4 text-lg leading-loose border-b border-base-300 ${
									role === 'assistant' && 'bg-base-100 px-12'
								}`}>
								<span className='avatar'>
									{role === 'user' && <FaUserLarge />}
									{role === 'assistant' && <BsChatRightText />}
								</span>
								<MarkdownComponent content={content} />
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
				<div className='join w-full'>
					<input
						type='text'
						placeholder='Message GeniusGPT'
						className='input input-bordered join-item w-full'
						value={text}
						onChange={(e) => {
							setText(e.target.value);
						}}
					/>
					<button
						className='btn btn-primary join-item'
						type='submit'
						disabled={isPending}>
						{isPending ? 'wait...' : <IoMdSend />}
					</button>
				</div>
			</form>
		</div>
	);
};

export default Chat;
