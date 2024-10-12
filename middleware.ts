import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const supportedLanguages = ['en', 'fa', 'tr'];
const defaultLanguage = 'en';

function getLanguageFromRequest(request: NextRequest): string {
	const pathname = request.nextUrl.pathname;
	const pathnameLanguage = supportedLanguages.find(
		(lang) => pathname.startsWith(`/${lang}/`) || pathname === `/${lang}`
	);
	if (pathnameLanguage) return pathnameLanguage;

	const acceptLanguage = request.headers.get('Accept-Language');
	if (acceptLanguage) {
		const headerLanguage = acceptLanguage.split(',')[0].split('-')[0];
		if (supportedLanguages.includes(headerLanguage)) return headerLanguage;
	}

	return defaultLanguage;
}

export function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	// Don't redirect requests for static assets in the personas folder
	if (pathname.startsWith('/images/')) {
		return NextResponse.next();
	}

	const language = getLanguageFromRequest(request);

	// If the pathname already includes a supported language, don't redirect
	if (
		supportedLanguages.some(
			(lang) => pathname.startsWith(`/${lang}/`) || pathname === `/${lang}`
		)
	) {
		return NextResponse.next();
	}

	// Redirect to the appropriate language path
	return NextResponse.redirect(new URL(`/${language}${pathname}`, request.url));
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
