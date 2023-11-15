import { BigNum, PRICE_PRECISION_EXP } from '@drift-labs/sdk';
import { COMMON_UI_UTILS } from '@drift/common';
import { createColumnHelper } from '@tanstack/react-table';
import React from 'react';

import { NumericValue } from '@/components/elements/Table';

import {
	UISerializableOrderWithOraclePrice,
	useVaultOpenOrders,
} from '@/hooks/table-data/useVaultOpenOrders';
import usePathToVaultPubKey from '@/hooks/usePathToVaultName';

import { getMarket } from '@/utils/utils';

import { VaultDataTableBase } from './VaultDataTableBase';

const columnHelper = createColumnHelper<UISerializableOrderWithOraclePrice>();

const columns = [
	columnHelper.accessor(
		(row) => {
			const fullMarketName = COMMON_UI_UTILS.getFullMarketName(
				getMarket(row.marketIndex, row.marketType)
			);

			return fullMarketName;
		},
		{
			header: 'Market',
			cell: (info) => <div className="w-[100px]">{info.getValue()}</div>,
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
				<NumericValue className="w-[15 0px]">{info.getValue()}</NumericValue>
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
				<NumericValue className="w-[160px]">{info.getValue()}</NumericValue>
			),
		}
	),
];

const OpenOrdersTableUnMemo = () => {
	const vaultPubKey = usePathToVaultPubKey();
	const vaultOpenOrders = useVaultOpenOrders(vaultPubKey);

	return <VaultDataTableBase data={vaultOpenOrders} columns={columns} />;
};

export const OpenOrdersTable = React.memo(OpenOrdersTableUnMemo);
