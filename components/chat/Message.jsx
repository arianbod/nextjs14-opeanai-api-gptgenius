import React, { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
	vscDarkPlus,
	vs,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Maximize2, Minimize2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useChat } from '@/context/ChatContext';

const Message = ({ role, content, timestamp }) => {
	const [expanded, setExpanded] = useState(false);
	const isUser = role === 'user';
	const { activeChat } = useChat();
	const copyToClipboard = (text) => {
		toast.success('Text copied');
		navigator.clipboard.writeText(text);
	};

	const formatTimestamp = (timestamp) => {
		return new Date(timestamp).toLocaleString();
	};

	return (
		<div className=' flex w-full'>
			{!isUser && (
				<Image
					src={activeChat.avatar}
					alt={role}
					width={40}
					height={40}
					className='rounded-full bg-black/75 p-1 w-8 h-8 mt-2 '
				/>
			)}
			<div
				className={`w-full flex flex-col ${
					isUser ? 'items-end bg-base-300' : 'items-start'
				} mb-4 hover:bg-base-200 rounded-lg p-4 transition-all max-w-full`}>
				<div className='flex justify-between items-center w-full mb-2'>
					<span
						className={`text-xs ${
							isUser ? 'text-base-content/75' : 'text-base-content/50'
						}`}>
						{formatTimestamp(timestamp)}
					</span>
					<button
						className='p-1 hover:bg-base-300 rounded'
						onClick={() => copyToClipboard(content)}
						title='Copy to clipboard'>
						<Copy
							size={12}
							className='text-base-content'
						/>
					</button>
				</div>
				<div className='w-full overflow-x-auto'>
					<ReactMarkdown
						components={{
							code({ node, inline, className, children, ...props }) {
								const match = /language-(\w+)/.exec(className || '');
								const codeString = String(children).replace(/\n$/, '');

								if (!inline && match) {
									return (
										<div className='relative'>
											<button
												className='absolute top-2 right-2 p-1 hover:bg-base-300 rounded'
												onClick={() => setExpanded(!expanded)}>
												{expanded ? (
													<Minimize2
														size={12}
														className='text-base-content'
													/>
												) : (
													<Maximize2
														size={12}
														className='text-base-content'
													/>
												)}
											</button>
											<SyntaxHighlighter
												language={match[1]}
												style={
													document.documentElement.getAttribute(
														'data-theme'
													) === 'dracula'
														? vscDarkPlus
														: vs
												}
												PreTag='div'
												{...props}
												customStyle={{
													maxHeight: expanded ? 'none' : '300px',
													overflow: 'auto',
													background: 'var(--tw-prose-pre-bg)',
													color: 'var(--tw-prose-pre-code)',
												}}>
												{codeString}
											</SyntaxHighlighter>
										</div>
									);
								}
								return (
									<code
										className={`${className} bg-base-300 text-base-content`}
										{...props}>
										{children}
									</code>
								);
							},
						}}>
						{content.replace(
							/OpenAI|0penAI|openAI|openai|OPENAI|Openai|اوپن‌ای‌آی/gi,
							'BabaGPT(A.Rafiei)'
						)}
					</ReactMarkdown>
				</div>
			</div>
		</div>
	);
};

export default memo(Message);
