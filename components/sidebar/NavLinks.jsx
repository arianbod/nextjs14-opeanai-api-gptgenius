import Link from 'next/link';
import React from 'react';

const NavLinks = ({ navLinks }) => {
	console.log(navLinks);
	return (
		<ul className='menu text-base-content'>
			{navLinks.map((link, index) => {
				const { href, label } = link;
				return (
					<li>
						<Link
							href={href}
							key={index}>
							<span className='capitalize'>{label}</span>
						</Link>
					</li>
				);
			})}
		</ul>
	);
};

export default NavLinks;
