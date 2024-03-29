import { SnapshotKey } from '@/types';
import { useOraclePriceStore } from '@drift-labs/react';
import {
	BN,
	BigNum,
	PERCENTAGE_PRECISION,
	PRICE_PRECISION_EXP,
	QUOTE_PRECISION_EXP,
	ZERO,
} from '@drift-labs/sdk';
import { HistoryResolution, MarketId } from '@drift/common';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { useVaultSnapshots } from '@/hooks/apis/useVaultSnapshots';
import useCurrentVaultAccountData from '@/hooks/useCurrentVaultAccountData';
import usePathToVaultPubKey from '@/hooks/usePathToVaultName';
import { useCurrentVault } from '@/hooks/useVault';
import useVaultApyAndCumReturns from '@/hooks/useVaultApyAndCumReturns';
import { useCurrentVaultStats } from '@/hooks/useVaultStats';

import { displayAssetValue as displayAssetValueBase } from '@/utils/utils';
import {
	getMaxDailyDrawdown,
	getMaxDailyDrawdownFromAccValue,
	getSimpleHistoricalApy,
} from '@/utils/vaults';

import { USDC_MARKET } from '@/constants/environment';
import { sourceCodePro } from '@/constants/fonts';
import { VAULTS } from '@/constants/vaults';

import SectionHeader from '../SectionHeader';
import ButtonTabs from '../elements/ButtonTabs';
import Dropdown, { Option } from '../elements/Dropdown';
import FadeInDiv from '../elements/FadeInDiv';
import BreakdownRow from './BreakdownRow';
import PerformanceGraph from './PerformanceGraph';

interface PerformanceGraphOption {
	label: string;
	value: HistoryResolution;
	days: number;
}

const PERFORMANCE_GRAPH_OPTIONS: PerformanceGraphOption[] = [
	{
		label: '7 Days',
		value: HistoryResolution.WEEK, // every 12 hours
		days: 7,
	},
	{
		label: '30 Days',
		value: HistoryResolution.MONTH, // every day
		days: 30,
	},
	{
		label: 'All',
		value: HistoryResolution.ALL,
		days: 0, // all
	},
];

enum OverallTimeline {
	Current,
	Historical,
}

enum GraphView {
	PnL,
	VaultBalance,
}

const GRAPH_VIEW_OPTIONS: {
	label: string;
	value: GraphView;
	snapshotAttribute: SnapshotKey;
}[] = [
	{
		label: 'P&L',
		value: GraphView.PnL,
		snapshotAttribute: 'allTimeTotalPnl',
	},
	{
		label: 'Vault Balance',
		value: GraphView.VaultBalance,
		snapshotAttribute: 'totalAccountValue',
	},
];

type DisplayedData = {
	totalEarnings: BigNum;
	totalEarningsQuote: BigNum;
	cumulativeReturnsPct: number;
	apy: number;
	maxDailyDrawdown: number;
};
const DEFAULT_DISPLAYED_DATA = {
	totalEarnings: BigNum.zero(),
	totalEarningsQuote: BigNum.zero(),
	cumulativeReturnsPct: 0,
	apy: 0,
	maxDailyDrawdown: 0,
};

export default function VaultPerformance() {
	const vault = useCurrentVault();
	const vaultPubKey = usePathToVaultPubKey();
	const vaultAccountData = useCurrentVaultAccountData();
	const vaultStats = useCurrentVaultStats();
	const { getMarketPriceData } = useOraclePriceStore();

	const [selectedGraphOption, setSelectedGraphOption] = useState(
		PERFORMANCE_GRAPH_OPTIONS[0]
	);
	const [graphView, setGraphView] = useState(GRAPH_VIEW_OPTIONS[0]);

	const [displayedData, setDisplayedData] = useState<DisplayedData>(
		DEFAULT_DISPLAYED_DATA
	);
	const [displayedGraph, setDisplayedGraph] = useState<
		{
			x: number;
			y: number;
		}[]
	>([]);
	const apyAndCumReturn = useVaultApyAndCumReturns(
		vaultAccountData?.pubkey.toString(),
		vaultAccountData?.user?.toString(),
		vaultAccountData?.spotMarketIndex ?? 0
	);
	const { snapshots } = useVaultSnapshots(vaultPubKey?.toString());

	const uiVaultConfig = VAULTS.find(
		(v) => v.pubkeyString === vaultAccountData?.pubkey.toString()
	);
	const spotMarketConfig = uiVaultConfig?.market ?? USDC_MARKET;
	const basePrecisionExp = spotMarketConfig.precisionExp;

	const overallTimelineOptions: Option[] = [
		{ label: 'Current', value: OverallTimeline.Current },
	];
	if (uiVaultConfig?.pastPerformanceHistory)
		overallTimelineOptions.push({
			label: uiVaultConfig.historyType ?? 'Historical',
			value: OverallTimeline.Historical,
		});

	const [selectedTimelineOption, setSelectedTimelineOption] = useState(
		overallTimelineOptions[0]
	);

	const vaultUserStats = vault?.vaultDriftClient.userStats?.getAccount();
	const makerVol30Day = vaultUserStats?.makerVolume30D ?? ZERO;
	const takerVol30Day = vaultUserStats?.takerVolume30D ?? ZERO;
	const totalVol30Day = makerVol30Day.add(takerVol30Day);

	const currentAssetPrice =
		getMarketPriceData(MarketId.createSpotMarket(spotMarketConfig.marketIndex))
			?.priceData.price ?? 0;
	const currentAssetPriceBigNum = BigNum.fromPrint(
		currentAssetPrice.toString(),
		PRICE_PRECISION_EXP
	);

	const loading = !vaultStats.isLoaded;

	useEffect(() => {
		if (!vault || !vaultAccountData || !vaultStats) return;

		if (selectedTimelineOption.value === OverallTimeline.Historical) {
			setDisplayedData(getDisplayedDataForHistorical());
			setDisplayedGraph(getDisplayedGraphForHistorical());
		} else if (selectedTimelineOption.value === OverallTimeline.Current) {
			setDisplayedData(getDisplayedDataForCurrent());
			setDisplayedGraph(getDisplayedGraphForCurrent());
		}
	}, [
		vault,
		vaultAccountData,
		vaultStats,
		selectedTimelineOption,
		selectedGraphOption,
		graphView,
		snapshots,
		apyAndCumReturn,
	]);

	const getDisplayedDataForHistorical = (): DisplayedData => {
		if (!uiVaultConfig?.pastPerformanceHistory) return DEFAULT_DISPLAYED_DATA;

		const lastHistoryData = uiVaultConfig.pastPerformanceHistory.slice(-1)[0];
		const firstHistoryData = uiVaultConfig.pastPerformanceHistory[0];

		const totalEarnings = lastHistoryData.allTimeTotalPnl;
		const totalEarningsQuote = totalEarnings
			.shiftTo(PRICE_PRECISION_EXP)
			.mul(currentAssetPriceBigNum);

		const cumulativeReturnsPct = totalEarnings
			.mul(PERCENTAGE_PRECISION)
			.mul(new BN(100))
			.div(lastHistoryData.netDeposits)
			.toNum();

		const apy = getSimpleHistoricalApy(
			lastHistoryData.netDeposits.toNumber() /
				spotMarketConfig.precision.toNumber(),
			lastHistoryData.totalAccountValue.toNum(),
			firstHistoryData.epochTs,
			lastHistoryData.epochTs
		);

		const maxDailyDrawdown = getMaxDailyDrawdownFromAccValue(
			uiVaultConfig.pastPerformanceHistory.map((history) => ({
				...history,
				totalAccountValue: history.totalAccountValue.toNum(),
			})) ?? []
		);

		return {
			totalEarnings,
			totalEarningsQuote,
			cumulativeReturnsPct,
			apy,
			maxDailyDrawdown,
		};
	};

	const getDisplayedGraphForHistorical = () => {
		if (!uiVaultConfig?.pastPerformanceHistory) return [];

		const data = uiVaultConfig.pastPerformanceHistory.map((history) => ({
			x: history.epochTs,
			y: history[graphView.snapshotAttribute] // historical data is initially already in base value, whereas current data is in quote value
				.mul(spotMarketConfig.precision)
				.toNum(),
		}));

		return data;
	};

	const getDisplayedDataForCurrent = (): DisplayedData => {
		const totalEarnings = BigNum.from(
			vaultStats.allTimeTotalPnlBaseValue,
			basePrecisionExp
		);
		const totalEarningsQuote = totalEarnings
			.shiftTo(PRICE_PRECISION_EXP)
			.mul(currentAssetPriceBigNum);

		const { apy, cumReturns: cumulativeReturnsPct } = apyAndCumReturn;
		const mappedSnapshotsToCalcDrawdown = snapshots
			.map((snapshot) => ({
				allTimeTotalPnl:
					+snapshot.totalAccountBaseValue - +snapshot.netDeposits,
				totalAccountValue: +snapshot.totalAccountBaseValue,
				ts: +snapshot.ts,
			}))
			.sort((a, b) => a.ts - b.ts);

		const maxDailyDrawdown = getMaxDailyDrawdown(mappedSnapshotsToCalcDrawdown);

		return {
			totalEarnings,
			totalEarningsQuote,
			cumulativeReturnsPct,
			apy,
			maxDailyDrawdown,
		};
	};

	const getDisplayedGraphForCurrent = () => {
		const startTs = selectedGraphOption.days
			? dayjs().subtract(selectedGraphOption.days, 'day').unix()
			: 0;

		const snapshotsWithinPeriod = snapshots.filter(
			(snapshot) => +snapshot.ts >= startTs
		);

		if (graphView.value === GraphView.VaultBalance) {
			return snapshotsWithinPeriod
				.map((snapshot) => {
					return {
						x: +snapshot.ts,
						y: +snapshot.totalAccountBaseValue,
					};
				})
				.concat({
					x: dayjs().unix(),
					y: vaultStats.totalAccountBaseValue.toNumber(),
				});
		}

		if (graphView.value === GraphView.PnL) {
			return snapshotsWithinPeriod
				.map((snapshot) => {
					return {
						x: +snapshot.ts,
						y: +snapshot.totalAccountBaseValue - +snapshot.netDeposits,
					};
				})
				.concat({
					x: dayjs().unix(),
					y: vaultStats.allTimeTotalPnlBaseValue.toNumber(),
				});
		}

		return [];
	};

	const displayAssetValue = (value: BigNum) =>
		displayAssetValueBase(value, spotMarketConfig.marketIndex ?? 0, true);

	return (
		<div className="flex flex-col w-full gap-8">
			<FadeInDiv className="flex flex-col w-full gap-4">
				<div className="flex items-center justify-between">
					<SectionHeader>Performance Breakdown</SectionHeader>
					{overallTimelineOptions.length > 1 && (
						<Dropdown
							options={overallTimelineOptions}
							selectedOption={selectedTimelineOption}
							setSelectedOption={setSelectedTimelineOption}
							width={120}
						/>
					)}
				</div>

				<div className="flex flex-col w-full gap-1 md:gap-2">
					<BreakdownRow
						label="Total Earnings (All Time)"
						value={displayAssetValue(displayedData.totalEarnings)}
						tooltip={{
							id: 'notional-earnings-tooltip',
							content: (
								<span className={twMerge(sourceCodePro.className)}>
									{displayedData.totalEarningsQuote.toNotional()}
								</span>
							),
							hide: spotMarketConfig.marketIndex === USDC_MARKET.marketIndex,
						}}
						loading={loading}
					/>
					<BreakdownRow
						label="Cumulative Return"
						value={`${displayedData.cumulativeReturnsPct.toFixed(2)}%`}
						loading={loading}
					/>
					<BreakdownRow
						label="APY"
						value={`${
							uiVaultConfig?.temporaryApy
								? uiVaultConfig.temporaryApy
								: displayedData.apy.toFixed(2)
						}%`}
						loading={loading}
					/>
					<BreakdownRow
						label="Max Daily Drawdown"
						value={`${(displayedData.maxDailyDrawdown * 100).toFixed(2)}%`}
						loading={loading}
					/>
					{selectedTimelineOption.value === OverallTimeline.Current && (
						<BreakdownRow
							label="30D Volume"
							value={`${BigNum.from(
								totalVol30Day,
								QUOTE_PRECISION_EXP
							).toNotional()}`}
							loading={loading}
						/>
					)}
				</div>
			</FadeInDiv>

			<FadeInDiv className="flex flex-col gap-4" delay={100}>
				<SectionHeader>Cumulative Performance</SectionHeader>
				<div className="flex justify-between w-full">
					<ButtonTabs
						tabs={GRAPH_VIEW_OPTIONS.map((option) => ({
							key: option.label,
							label: option.label,
							selected: graphView.value === option.value,
							onSelect: () => setGraphView(option),
						}))}
						tabClassName="whitespace-nowrap px-4 py-2"
					/>
					{selectedTimelineOption.value === OverallTimeline.Current && (
						<Dropdown
							options={PERFORMANCE_GRAPH_OPTIONS}
							selectedOption={selectedGraphOption}
							setSelectedOption={
								setSelectedGraphOption as (option: {
									label: string;
									value: HistoryResolution;
								}) => void
							}
							width={120}
						/>
					)}
				</div>
				<div className="w-full h-[320px]">
					{!!displayedGraph?.length && (
						<div>
							<PerformanceGraph
								data={displayedGraph}
								marketIndex={spotMarketConfig.marketIndex}
								isPnl={graphView.value === GraphView.PnL}
							/>
							<div className="text-xs text-right text-gray-600">
								Powered by Coingecko
							</div>
						</div>
					)}
				</div>
			</FadeInDiv>
		</div>
	);
}
