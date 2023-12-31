import Skeleton from 'react-loading-skeleton';
import { twMerge } from 'tailwind-merge';

import { sourceCodePro } from '@/constants/fonts';

import { Tooltip } from '../elements/Tooltip';

const BreakdownRow = ({
	label,
	value,
	tooltip,
	loading,
}: {
	label: string;
	value: string;
	tooltip?: {
		id: string;
		content: React.ReactNode;
		hide?: boolean;
	};
	loading?: boolean;
}) => {
	return (
		<div className="flex justify-between md:text-xl">
			<span>{label}</span>
			{loading ? (
				<Skeleton className="w-10" />
			) : (
				<span
					className={twMerge(
						sourceCodePro.className,
						'text-text-emphasis text-right'
					)}
					data-tooltip-id={tooltip?.id}
				>
					{value}
				</span>
			)}
			{tooltip && !tooltip?.hide && (
				<Tooltip id={tooltip.id}>{tooltip.content}</Tooltip>
			)}
		</div>
	);
};

export default BreakdownRow;
