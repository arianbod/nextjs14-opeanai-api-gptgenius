// components/common/LocaleLink.tsx
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

interface LocaleLinkProps extends React.ComponentProps<typeof Link> {
	href: string;
	children: React.ReactNode;
}

const LocaleLink = ({ href, children, ...props }: LocaleLinkProps) => {
	const { lang } = useParams();
	const cleanedHref = href.startsWith('/')
		? `/${lang}${href}`
		: `/${lang}/${href}`;
	return (
		<Link
			href={cleanedHref}
			{...props}>
			{children}
		</Link>
	);
};

export default LocaleLink;
