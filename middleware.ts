import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
	const user = request.cookies.get('user');

	// List of paths that don't require authentication
	const publicPaths = ['/', '/api/auth/register', '/api/auth/login'];

	// Allow access to public paths and API routes without authentication
	if (
		publicPaths.includes(request.nextUrl.pathname) ||
		request.nextUrl.pathname.startsWith('/api/')
	) {
		return NextResponse.next();
	}

	// Redirect to home if user is not authenticated and trying to access a protected route
	if (!user) {
		return NextResponse.redirect(new URL('/', request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!_next/static|favicon.ico).*)'],
};
