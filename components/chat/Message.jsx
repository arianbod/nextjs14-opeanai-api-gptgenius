import React, { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypePrism from 'rehype-prism-plus';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
	vscDarkPlus,
	vs,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Maximize2, Minimize2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/legacy/image';
import { useChat } from '@/context/ChatContext';

// Import common programming languages
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import python from 'react-syntax-highlighter/dist/cjs/languages/prism/python';
import java from 'react-syntax-highlighter/dist/cjs/languages/prism/java';
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
import sql from 'react-syntax-highlighter/dist/cjs/languages/prism/sql';
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json';
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import markdown from 'react-syntax-highlighter/dist/cjs/languages/prism/markdown';
import css from 'react-syntax-highlighter/dist/cjs/languages/prism/css';
import markup from 'react-syntax-highlighter/dist/cjs/languages/prism/markup';

// Register languages
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('markup', markup);
SyntaxHighlighter.registerLanguage('jsx', javascript);
SyntaxHighlighter.registerLanguage('html', markup);

// Helper function to detect RTL
const isRTL = (text) => {
	if (!text || typeof text !== 'string') return false;
	const rtlRegex =
		/[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
	return rtlRegex.test(text.trim()[0]);
};

// Helper function to detect language
const detectLanguage = (text) => {
	if (!text || typeof text !== 'string') return 'default';
	const persianRegex = /[\u0600-\u06FF]/;
	const arabicRegex = /[\u0627-\u064A]/;

	if (persianRegex.test(text)) return 'persian';
	if (arabicRegex.test(text)) return 'arabic';
	return 'default';
};

const Message = ({ role, content, timestamp }) => {
	const [expanded, setExpanded] = useState(false);
	const isUser = role === 'user';
	const { activeChat } = useChat();

	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text);
		toast.success(
			`${isUser ? 'your' : activeChat.model.name} message Copied to clipboard`
		);
	};

	const formatTimestamp = (timestamp) => {
		return new Date(timestamp).toLocaleString();
	};

	const extractTextContent = (node) => {
		if (typeof node === 'string') return node;
		if (Array.isArray(node)) return node.map(extractTextContent).join('');
		if (node?.props?.children) return extractTextContent(node.props.children);
		if (node?.props?.value) return node.props.value;
		return '';
	};

	const MarkdownComponents = {
		p: ({ children }) => {
			const text = extractTextContent(children);
			const rtl = isRTL(text);
			const lang = detectLanguage(text);

			return (
				<div
					className={`mb-4 last:mb-0 leading-7 text-gray-800 dark:text-gray-200
                    ${rtl ? 'text-right' : 'text-left'}
                    ${lang === 'persian' ? 'font-persian' : ''}
                    ${lang === 'arabic' ? 'font-arabic' : ''}`}
					dir={rtl ? 'rtl' : 'ltr'}>
					{children}
				</div>
			);
		},

		h3: ({ children }) => {
			const text = extractTextContent(children);
			const rtl = isRTL(text);
			const lang = detectLanguage(text);

			return (
				<h3
					className={`text-lg font-bold mt-6 mb-4 text-gray-900 dark:text-gray-100
                    ${rtl ? 'text-right' : 'text-left'}
                    ${lang === 'persian' ? 'font-persian' : ''}
                    ${lang === 'arabic' ? 'font-arabic' : ''}`}
					dir={rtl ? 'rtl' : 'ltr'}>
					{children}
				</h3>
			);
		},

		hr: () => (
			<hr className='my-6 border-t border-gray-200 dark:border-gray-700' />
		),

		blockquote: ({ children }) => {
			const text = extractTextContent(children);
			const rtl = isRTL(text);
			const lang = detectLanguage(text);

			return (
				<blockquote
					className={`border-l-4 border-gray-200 dark:border-gray-700 
                    pl-4 my-4 italic text-gray-700 dark:text-gray-300
                    ${rtl ? 'text-right border-r-4 pr-4 pl-0 border-l-0' : ''}
                    ${lang === 'persian' ? 'font-persian' : ''}
                    ${lang === 'arabic' ? 'font-arabic' : ''}`}
					dir={rtl ? 'rtl' : 'ltr'}>
					{children}
				</blockquote>
			);
		},

		ul: ({ children }) => {
			return (
				<ul className='list-disc pl-6 mb-4 space-y-2 text-gray-800 dark:text-gray-200'>
					{children}
				</ul>
			);
		},

		ol: ({ children }) => {
			return (
				<ol className='list-decimal pl-6 mb-4 space-y-2 text-gray-800 dark:text-gray-200'>
					{children}
				</ol>
			);
		},

		li: ({ children }) => {
			const text = extractTextContent(children);
			const rtl = isRTL(text);
			const lang = detectLanguage(text);

			return (
				<li
					className={`leading-relaxed
                    ${rtl ? 'text-right' : 'text-left'}
                    ${lang === 'persian' ? 'font-persian' : ''}
                    ${lang === 'arabic' ? 'font-arabic' : ''}`}
					dir={rtl ? 'rtl' : 'ltr'}>
					{children}
				</li>
			);
		},

		table: ({ children }) => (
			<div className='w-full overflow-x-auto my-6'>
				<table
					className='w-full border-collapse bg-white dark:bg-gray-900 
                                 rounded-lg border border-gray-200 dark:border-gray-700'>
					{children}
				</table>
			</div>
		),

		thead: ({ children }) => (
			<thead className='bg-gray-100 dark:bg-gray-800'>{children}</thead>
		),

		th: ({ children }) => {
			const text = extractTextContent(children);
			const rtl = isRTL(text);
			const lang = detectLanguage(text);

			return (
				<th
					className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 
                         uppercase tracking-wider border-b border-gray-200 dark:border-gray-700
                         ${rtl ? 'text-right' : 'text-left'}
                         ${lang === 'persian' ? 'font-persian' : ''}
                         ${lang === 'arabic' ? 'font-arabic' : ''}`}
					dir={rtl ? 'rtl' : 'ltr'}>
					{children}
				</th>
			);
		},

		td: ({ children }) => {
			const text = extractTextContent(children);
			const rtl = isRTL(text);
			const lang = detectLanguage(text);

			return (
				<td
					className={`px-6 py-4 text-sm border-b border-gray-200 dark:border-gray-700 
                         text-gray-800 dark:text-gray-200
                         ${rtl ? 'text-right' : 'text-left'}
                         ${lang === 'persian' ? 'font-persian' : ''}
                         ${lang === 'arabic' ? 'font-arabic' : ''}`}
					dir={rtl ? 'rtl' : 'ltr'}>
					{children}
				</td>
			);
		},

		code({ node, inline, className, children, ...props }) {
			const match = /language-(\w+)/.exec(className || '');
			const codeContent = extractTextContent(children);

			if (inline) {
				return (
					<code
						className='bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 
                                 px-1.5 py-0.5 rounded text-sm'
						{...props}>
						{codeContent}
					</code>
				);
			}

			return (
				<div className='not-prose my-4'>
					<div className='rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700'>
						<div className='flex justify-between items-center px-4 py-2 bg-gray-100 dark:bg-gray-800'>
							<span className='text-xs text-gray-600 dark:text-gray-300 '>
								{match?.[1] || 'Plain Text'}
							</span>
							<div className='flex gap-2'>
								<button
									onClick={() => copyToClipboard(codeContent)}
									className='p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors'
									title='Copy code'>
									<Copy
										size={12}
										className='text-gray-600 dark:text-gray-300'
									/>
								</button>
								<button
									onClick={() => setExpanded(!expanded)}
									className='p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors'
									title={expanded ? 'Collapse' : 'Expand'}>
									{expanded ? (
										<Minimize2
											size={12}
											className='text-gray-600 dark:text-gray-300'
										/>
									) : (
										<Maximize2
											size={12}
											className='text-gray-600 dark:text-gray-300'
										/>
									)}
								</button>
							</div>
						</div>
						<div
							className={`relative ${
								expanded ? '' : 'max-h-[300px]'
							} overflow-auto`}>
							<SyntaxHighlighter
								language={match?.[1] || 'text'}
								style={
									document.documentElement.getAttribute('data-theme') ===
									'dracula'
										? vscDarkPlus
										: vs
								}
								showLineNumbers={true}
								customStyle={{
									margin: 0,
									padding: '1rem',
									background: 'transparent',
									fontSize: '0.875rem',
								}}
								wrapLongLines={true}>
								{codeContent}
							</SyntaxHighlighter>
							{!expanded && (
								<div
									className='absolute bottom-0 left-0 right-0 h-8 
                                              bg-gradient-to-t from-white dark:from-gray-900 to-transparent'
								/>
							)}
						</div>
					</div>
				</div>
			);
		},

		math: ({ value }) => (
			<div className='py-2 overflow-x-auto'>
				<div
					className='katex-display'
					dangerouslySetInnerHTML={{ __html: value }}
				/>
			</div>
		),

		inlineMath: ({ value }) => (
			<span
				className='katex-inline'
				dangerouslySetInnerHTML={{ __html: value }}
			/>
		),

		p: ({ children }) => {
			const text = extractTextContent(children);
			const rtl = isRTL(text);
			const lang = detectLanguage(text);

			const content = children?.toString() || '';
			if (content.includes('\\sum') || content.includes('\\int')) {
				return (
					<div className='math-content py-2'>
						<div
							className='katex-display'
							dangerouslySetInnerHTML={{ __html: content }}
						/>
					</div>
				);
			}
			return (
				<div
					className={`mb-4 last:mb-0 leading-7 text-gray-800 dark:text-gray-200
                    ${rtl ? 'text-right' : 'text-left'}
                    ${lang === 'persian' ? 'font-persian' : ''}
                    ${lang === 'arabic' ? 'font-arabic' : ''}`}
					dir={rtl ? 'rtl' : 'ltr'}>
					{children}
				</div>
			);
		},
	};

	return (
		<div
			className={`w-full max-w-[97vw] lg:max-w-3xl flex gap-0 mx-auto ${
				isUser ? 'justify-end' : ''
			}`}>
			{!isUser && (
				<div className='w-1/12'>
					<Image
						src={activeChat.avatar}
						alt={role}
						width={40}
						height={40}
						objectFit='contain'
						className='rounded-full bg-gray-900 dark:bg-gray-800 p-1 w-8 h-8 max-h-16 mt-2'
					/>
				</div>
			)}
			<div
				className={`flex flex-col mb-4 rounded-lg p-4 transition-all
                           ${
															isUser
																? 'w-1/2 bg-gray-100 dark:bg-gray-800'
																: 'w-11/12 '
														}`}>
				<div className='flex justify-between items-center w-full mb-2'>
					<span
						className={`text-xs ${
							isUser
								? 'text-gray-600 dark:text-gray-400'
								: 'text-gray-500 dark:text-gray-500'
						}`}>
						{formatTimestamp(timestamp)}
					</span>
					<button
						className='p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded'
						onClick={() => copyToClipboard(content)}
						title='Copy message'>
						<Copy
							size={12}
							className='text-gray-600 dark:text-gray-400'
						/>
					</button>
				</div>
				<div className='w-full overflow-x-auto text-wrap'>
					<ReactMarkdown
						remarkPlugins={[remarkMath, remarkGfm]}
						rehypePlugins={[
							rehypeKatex,
							[rehypePrism, { ignoreMissing: true }],
						]}
						components={MarkdownComponents}>
						{content}
					</ReactMarkdown>
				</div>
			</div>
		</div>
	);
};

export default memo(Message);
