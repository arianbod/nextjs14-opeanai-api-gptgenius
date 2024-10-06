import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
	vscDarkPlus,
	vs,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, ThumbsUp, ThumbsDown, Maximize2, Minimize2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Message = ({ role, content, timestamp }) => {
	const [expanded, setExpanded] = useState(false);
	const [reaction, setReaction] = useState(null);
	const isUser = role === 'user';

	const copyToClipboard = (text) => {
		toast.success('text copied');
		navigator.clipboard.writeText(text);
	};

	const formatTimestamp = (timestamp) => {
		return new Date(timestamp).toLocaleString();
	};

	return (
		<div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
			<div
				className={`max-w-full lg:max-w-[80%] ${
					isUser ? 'bg-blue-500 text-white' : ''
				} p-4 rounded-lg shadow-md`}>
				<div className='flex justify-between items-center mb-2'>
					<span
						className={`text-[12px] ${
							isUser ? 'text-gray-300/75' : 'text-gray-500'
						}`}>
						{formatTimestamp(timestamp)}
					</span>
					<div className='flex space-x-2'>
						<button
							className='p-1 hover:bg-gray-200/25 rounded'
							onClick={() => copyToClipboard(content)}
							title='Copy to clipboard'>
							<Copy size={12} />
						</button>
						{!isUser && (
							<>
								<button
									className='p-1 hover:bg-gray-200/25 rounded'
									onClick={() =>
										setReaction(reaction === 'like' ? null : 'like')
									}
									title={reaction === 'like' ? 'Unlike' : 'Like'}>
									<ThumbsUp
										size={16}
										className={reaction === 'like' ? 'text-green-500' : ''}
									/>
								</button>
								<button
									className='p-1 hover:bg-gray-200/25 rounded'
									onClick={() =>
										setReaction(reaction === 'dislike' ? null : 'dislike')
									}
									title={reaction === 'dislike' ? 'Remove dislike' : 'Dislike'}>
									<ThumbsDown
										size={16}
										className={reaction === 'dislike' ? 'text-red-500' : ''}
									/>
								</button>
							</>
						)}
					</div>
				</div>
				<ReactMarkdown
					components={{
						code({ node, inline, className, children, ...props }) {
							const match = /language-(\w+)/.exec(className || '');
							const codeString = String(children).replace(/\n$/, '');

							if (!inline && match) {
								return (
									<div className='relative'>
										<button
											className='absolute top-2 right-2 p-1  hover:bg-gray-300/25 rounded'
											onClick={() => setExpanded(!expanded)}>
											{expanded ? (
												<Minimize2 size={12} />
											) : (
												<Maximize2 size={12} />
											)}
										</button>

										<SyntaxHighlighter
											language={match[1]}
											style={
												document.documentElement.getAttribute('data-theme') ===
												'dracula'
													? vscDarkPlus
													: vs
											}
											PreTag='div'
											{...props}
											customStyle={{
												maxHeight: expanded ? 'none' : '300px',
												overflow: 'auto',
											}}>
											{codeString}
										</SyntaxHighlighter>
									</div>
								);
							}
							return (
								<code
									className={className}
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
	);
};

export default Message;
