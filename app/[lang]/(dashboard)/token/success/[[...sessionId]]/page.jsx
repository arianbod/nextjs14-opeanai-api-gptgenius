import ClientSuccessPage from './successComponent';

// Page component - Server Component
export default async function Page({ params }) {
	return <ClientSuccessPage sessionId={params.sessionId} />;
}

// Client Success Page Component