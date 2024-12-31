// components/sidebar/AccountSection.jsx
import { FaUser } from 'react-icons/fa'; // Using Font Awesome instead
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from '@/context/TranslationContext';

const AccountSection = ({ className }) => {
	const { user, logout } = useAuth();
	const { t } = useTranslations();

	return (
		<div className={`${className} p-4 border-t border-base-300`}>
			<Link
				href='/account'
				className='flex items-center gap-3 p-2 hover:bg-base-300 rounded-lg transition-colors mb-2'>
				<div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center'>
					<FaUser className='w-5 h-5' /> {/* Using FaUser instead */}
				</div>
				<div>
					<div className='font-medium'>
						{dict.accountManagement.accountSetting}
					</div>
					<div className='text-sm text-base-content/70'>
						{user.email || 'Manage your account'}
					</div>
				</div>
			</Link>
			<button
				onClick={logout}
				className='w-full p-2 text-error hover:bg-error/10 rounded-lg transition-colors text-sm'>
				{t('auth.logout')}
			</button>
		</div>
	);
};

export default AccountSection;
