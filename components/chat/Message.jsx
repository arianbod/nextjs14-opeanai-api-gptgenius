import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
	vscDarkPlus,
	vs,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Maximize2, Minimize2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Message = ({ role, content, timestamp }) => {
	const [expanded, setExpanded] = useState(false);
	const isUser = role === 'user';

	const copyToClipboard = (text) => {
		toast.success('Text copied');
		navigator.clipboard.writeText(text);
	};

	const formatTimestamp = (timestamp) => {
		return new Date(timestamp).toLocaleString();
	};

	return (
		<div
			className={`flex flex-col ${
				isUser ? 'items-end bg-gray-700 text-white' : 'items-start'
			} mb-4 hover:bg-black/25 rounded-lg p-4 transition-all max-w-full`}>
			<div className='flex justify-between items-center w-full mb-2'>
				<span
					className={`text-xs ${
						isUser ? 'text-gray-300/75' : 'text-gray-500'
					}`}>
					{formatTimestamp(timestamp)}
				</span>
				<button
					className='p-1 hover:bg-gray-200/25 rounded'
					onClick={() => copyToClipboard(content)}
					title='Copy to clipboard'>
					<Copy size={12} />
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
											className='absolute top-2 right-2 p-1 hover:bg-gray-300/25 rounded'
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
