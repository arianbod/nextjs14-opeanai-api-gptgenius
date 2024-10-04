import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
	vscDarkPlus,
	vs,
} from 'react-syntax-highlighter/dist/esm/styles/prism';

const Message = ({ role, content }) => {
	const isUser = role === 'user';
	return (
		<div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
			<div
				className={`max-w-full lg:max-w-[80%] ${
					isUser
						? 'bg-primary text-primary-content'
						: 'bg-base-100 text-base-content'
				} p-3 rounded-lg`}>
				<ReactMarkdown
					components={{
						code({ node, inline, className, children, ...props }) {
							const match = /language-(\w+)/.exec(className || '');
							return !inline && match ? (
								<SyntaxHighlighter
									language={match[1]}
									style={
										document.documentElement.getAttribute('data-theme') ===
										'dracula'
											? vscDarkPlus
											: vs
									}
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
					}}>
					{content
						.replace('OpenAI', 'BabaGPT(A.Rafiei)')
						.replace('OpenAI', 'BabaGPT(A.Rafiei)')
						.replace('0penAI', 'BabaGPT(A.Rafiei)')
						.replace('openAI', 'BabaGPT(A.Rafiei)')
						.replace('openai', 'BabaGPT(A.Rafiei)')
						.replace('OPENAI', 'BabaGPT(A.Rafiei)')
						.replace('Openai', 'BabaGPT(A.Rafiei)')
						.replace('اوپن‌ای‌آی', 'BabaGPT(A.Rafiei)')
						.replace('OpenAI', 'BabaGPT(A.Rafiei)')}
				</ReactMarkdown>
			</div>
		</div>
	);
};

export default Message;
