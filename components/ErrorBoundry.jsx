// components/ErrorBoundary.jsx
'use client';

import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true, error };
	}

	componentDidCatch(error, errorInfo) {
		console.error('Application Error:', error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className='p-4'>
					<Alert variant='destructive'>
						<AlertTitle>Something went wrong</AlertTitle>
						<AlertDescription>
							{this.state.error?.message || 'An unexpected error occurred'}
							{process.env.NODE_ENV === 'development' && (
								<pre className='mt-2 text-xs whitespace-pre-wrap'>
									{this.state.error?.stack}
								</pre>
							)}
						</AlertDescription>
					</Alert>
					<button
						onClick={() => window.location.reload()}
						className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'>
						Reload Page
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
