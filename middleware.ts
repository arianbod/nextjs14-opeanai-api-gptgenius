import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware({
	publicRoutes: ['/sign-in', '/sign-up'], // Add public routes if needed
});

export const config = {
	matcher: [
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
		'/(api|trpc)(.*)', // Protect API routes
	],
};
