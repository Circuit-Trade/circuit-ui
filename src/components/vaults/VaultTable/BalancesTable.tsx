import { UserBalance } from '@/types';
import { createColumnHelper } from '@tanstack/react-table';
import { twMerge } from 'tailwind-merge';

import { Table } from '@/components/elements/Table';

import { useVaultBalances } from '@/hooks/table-data/useVaultBalances';
import { useCurrentVault } from '@/hooks/useVault';

import { OrderedSpotMarkets } from '@/constants/environment';
import { sourceCodePro } from '@/constants/fonts';

const NumericValue = ({
	children,
	widthClass,
}: {
	children: React.ReactNode;
	widthClass?: string;
}) => {
	return (
		<div
			className={twMerge(
				sourceCodePro.className,
				widthClass,
				'whitespace-nowrap'
			)}
		>
			{children}
		</div>
	);
};

const columnHelper = createColumnHelper<UserBalance>();

const columns = [
	columnHelper.accessor('marketIndex', {
		header: 'Asset',
		cell: (info) => (
			<div className="w-[60px]">
				{OrderedSpotMarkets[info.getValue()].symbol}
			</div>
		),
	}),
	columnHelper.accessor(
		(row) =>
			`${row.baseBalance.prettyPrint()} ${
				OrderedSpotMarkets[row.marketIndex].symbol
			}`,
		{
			id: 'baseBalance',
			header: () => 'Balance',
			cell: (info) => (
				<NumericValue widthClass="w-[215px]">{info.getValue()}</NumericValue>
			),
		}
	),
	columnHelper.accessor('quoteValue', {
		header: () => 'Notional',
		cell: (info) => (
			<NumericValue widthClass="w-[190px]">
				${info.getValue().prettyPrint()}
			</NumericValue>
		),
	}),
	columnHelper.accessor('liquidationPrice', {
		header: () => 'Liq. Price',
		cell: (info) => (
			<NumericValue widthClass="w-[140px]">
				${info.getValue().prettyPrint()}
			</NumericValue>
		),
	}),
];

export const BalancesTable = () => {
	const vault = useCurrentVault();
	const vaultDriftUserAccount = vault?.vaultDriftUserAccount;
	const vaultDriftUser = vault?.vaultDriftUser;
	const vaultBalances = useVaultBalances(vaultDriftUserAccount, vaultDriftUser);

	return <Table data={vaultBalances} columns={columns} />;
};
