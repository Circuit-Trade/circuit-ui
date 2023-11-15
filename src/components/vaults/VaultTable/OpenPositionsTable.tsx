import {
	BASE_PRECISION_EXP,
	BigNum,
	PRICE_PRECISION_EXP,
	ZERO,
} from '@drift-labs/sdk';
import { COMMON_UI_UTILS, OpenPosition } from '@drift/common';
import { createColumnHelper } from '@tanstack/react-table';
import { twMerge } from 'tailwind-merge';

import { NumericValue, Table } from '@/components/elements/Table';

import { useVaultOpenPerpPositions } from '@/hooks/table-data/useVaultOpenPerpPositions';
import usePathToVaultPubKey from '@/hooks/usePathToVaultName';

const columnHelper = createColumnHelper<OpenPosition>();

const columns = [
	columnHelper.accessor('marketSymbol', {
		header: 'Market',
		cell: (info) => <div className="w-[100px]">{info.getValue()}</div>,
	}),
	columnHelper.accessor('direction', {
		header: 'Direction',
		cell: (info) => (
			<div
				className={twMerge(
					'w-[80px] uppercase',
					info.getValue() === 'long'
						? 'text-text-success-green'
						: 'text-text-negative-red'
				)}
			>
				{info.getValue()}
			</div>
		),
	}),
	columnHelper.accessor(
		(row) =>
			`${BigNum.from(
				row.baseSize.abs(),
				BASE_PRECISION_EXP
			).prettyPrint()} ${COMMON_UI_UTILS.getBaseAssetSymbol(row.marketSymbol)}`,
		{
			header: 'Size',
			cell: (info) => (
				<NumericValue className="w-[140px]">{info.getValue()}</NumericValue>
			),
		}
	),
	columnHelper.accessor(
		(row) => (
			<div className="flex flex-col">
				<span>${BigNum.from(row.entryPrice, PRICE_PRECISION_EXP).toNum()}</span>
				{/* <span className="text-[13px] text-text-secondary"> // TODO: implement dlobStore and priceStore
					${BigNum.from(row.entryPrice, PRICE_PRECISION_EXP).toNum()}
				</span> */}
			</div>
		),
		{
			header: 'Entry',
			cell: (info) => (
				<NumericValue className="w-[120px]">{info.getValue()}</NumericValue>
			),
		}
	),
	columnHelper.accessor(
		(row) => (
			<div
				className={twMerge(
					row.pnl.lt(ZERO)
						? 'text-text-negative-red'
						: 'text-text-positive-green'
				)}
			>
				{row.pnl.lt(ZERO) ? '-' : ''}$
				{BigNum.from(row.pnl, PRICE_PRECISION_EXP).abs().prettyPrint()}
				<div className="text-[13px]">
					{COMMON_UI_UTILS.calculatePnlPctFromPosition(
						row.pnl,
						row.quoteEntryAmount
					).toFixed(3)}
					%
				</div>
			</div>
		),
		{
			header: 'P&L',
			cell: (info) => (
				<NumericValue className="w-[160px]">{info.getValue()}</NumericValue>
			),
		}
	),
	columnHelper.accessor('liqPrice', {
		header: 'Liq. Price',
		cell: (info) => {
			const liqPrice = BigNum.from(info.getValue(), PRICE_PRECISION_EXP);

			return (
				<NumericValue className="w-[140px]">
					{liqPrice.lteZero() ? 'None' : `$${liqPrice.prettyPrint()}`}
				</NumericValue>
			);
		},
	}),
];

export const OpenPositionsTable = () => {
	const vaultPubKey = usePathToVaultPubKey();
	const openPositions = useVaultOpenPerpPositions(vaultPubKey);

	return <Table data={openPositions} columns={columns} />;
};
