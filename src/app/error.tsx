'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/elements/Button';

import { syne } from '@/constants/fonts';

export default function Error({
	error,
	reset,
}: {
	error: Error;
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="w-full pt-[40%] md:pt-[20%] text-center flex flex-col gap-4 items-center">
			<span className={twMerge(syne.className, 'text-xl md:text-4xl')}>
				Something went wrong
			</span>
			<Button className="max-w-[300px] w-full py-3">
				<Link href="/">Return Home</Link>
			</Button>
		</div>
	);
}
