import {
	BigNum,
	MarketType,
	PRICE_PRECISION_EXP,
	PositionDirection,
} from '@drift-labs/sdk';
import { COMMON_UI_UTILS, UIMarket, matchEnum } from '@drift/common';
import { createColumnHelper } from '@tanstack/react-table';
import React from 'react';

import Table from '@/components/elements/Table';

import { UISerializableOrderWithOraclePrice } from '@/hooks/table-data/useVaultOpenOrders';
import { useCurrentVault } from '@/hooks/useVault';

import { VaultDataTableBase } from './VaultDataTableBase';

const columnHelper = createColumnHelper<UISerializableOrderWithOraclePrice>();

const columns = [
	columnHelper.accessor(
		(order) => {
			const fullMarketName = new UIMarket(order.marketIndex, order.marketType)
				.marketName;
			const direction = matchEnum(order.marketType, MarketType.PERP)
				? matchEnum(order.direction, PositionDirection.LONG)
					? 'long'
					: 'short'
				: matchEnum(order.direction, PositionDirection.LONG)
				  ? 'buy'
				  : 'sell';

			return (
				<Table.MarketCell
					marketName={fullMarketName}
					direction={direction}
					className="w-[100px]"
				/>
			);
		},
		{
			header: 'Market',
			cell: (info) => info.getValue(),
		}
	),
	columnHelper.accessor(
		(order) => COMMON_UI_UTILS.getOrderLabelFromOrderDetails(order),
		{
			header: 'Type',
			cell: (info) => (
				<div className="w-[80px] uppercase">{info.getValue()}</div>
			),
		}
	),
	columnHelper.accessor(
		(order) =>
			`${COMMON_UI_UTILS.trimTrailingZeros(
				order.baseAssetAmountFilled.toTradePrecision()
			)} / ${COMMON_UI_UTILS.trimTrailingZeros(
				order.baseAssetAmount.toTradePrecision()
			)}`,
		{
			header: 'Filled / Size',
			cell: (info) => (
				<Table.NumericValue className="w-[150px]">
					{info.getValue()}
				</Table.NumericValue>
			),
		}
	),
	columnHelper.accessor(
		(order) => {
			const orderLimitPrice = COMMON_UI_UTILS.getLimitPriceFromOracleOffset(
				order,
				BigNum.from(order.oraclePrice, PRICE_PRECISION_EXP)
			);

			const triggerPrice = order.triggerPrice.eqZero()
				? '-'
				: order.triggerPrice.toNotional(true);
			const limitPrice = orderLimitPrice.eqZero()
				? '-'
				: orderLimitPrice.toNotional(true);

			return `${triggerPrice} / ${limitPrice}`;
		},
		{
			header: 'Trigger / Limit',
			cell: (info) => (
				<Table.NumericValue className="w-[160px]">
					{info.getValue()}
				</Table.NumericValue>
			),
		}
	),
];

const OpenOrdersTableUnMemo = () => {
	const vaultOpenOrders = useCurrentVault()?.accountSummary.openOrders ?? [];

	return (
		<VaultDataTableBase
			data={vaultOpenOrders}
			columns={columns}
			stickyFirstColumn
		/>
	);
};

export const OpenOrdersTable = React.memo(OpenOrdersTableUnMemo);
