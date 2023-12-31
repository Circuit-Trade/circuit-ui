'use client';

import { BigNum } from '@drift-labs/sdk';
import { Config } from '@drift/common';
import dayjs from 'dayjs';
import {
	Area,
	AreaChart,
	CartesianGrid,
	DotProps,
	ResponsiveContainer,
	Tooltip,
	TooltipProps,
	XAxis,
	YAxis,
} from 'recharts';
import { twMerge } from 'tailwind-merge';

import { normalizeDate } from '@/utils/utils';

import { USDC_MARKET } from '@/constants/environment';

const CustomTooltip = ({
	active,
	payload,
	label,
	marketIndex,
	isPnl,
}: TooltipProps<number, string> & {
	marketIndex: number;
	isPnl: boolean;
}) => {
	if (active && payload && payload.length) {
		const date = dayjs.unix(label).format('D MMM YYYY');
		const value = payload[0].value ?? 0;

		const isProfit = value >= 0;
		const market = Config.spotMarketsLookup[marketIndex];
		const isUsdcAsset = marketIndex === USDC_MARKET.marketIndex;

		return (
			<div className="bg-black border border-[#32D7D720] p-2">
				<p>{date}</p>
				<p
					className={twMerge(
						isProfit ? 'text-success-green-border' : 'text-error-red-border'
					)}
				>
					{isProfit && isPnl && '+'}
					{`${isUsdcAsset ? '$' : ''}${BigNum.from(
						value,
						market.precisionExp
					).prettyPrint(true)}${isUsdcAsset ? '' : ` ${market.symbol}`}`}
				</p>
			</div>
		);
	}

	return null;
};

const getDateTicks = (
	firstDateTs: number,
	interval: number,
	unit: dayjs.ManipulateType,
	lastDateTs: number
) => {
	let lastDate = dayjs.unix(normalizeDate(lastDateTs));
	const firstDate = dayjs.unix(firstDateTs);
	const ticks = [];

	while (lastDate.isSameOrAfter(firstDate)) {
		ticks.push(lastDate.unix());
		lastDate = lastDate.subtract(interval, unit);
	}

	return ticks.reverse();
};

const getCustomXAxisTicks = (
	dataLength: number,
	firstDateTs: number,
	lastDateTs: number
) => {
	// if data is in days
	if (dataLength <= 21) {
		return getDateTicks(firstDateTs, 2, 'day', lastDateTs);
	} else if (dataLength <= 60) {
		return getDateTicks(firstDateTs, 1, 'week', lastDateTs);
	} else if (dataLength <= 180) {
		return getDateTicks(firstDateTs, 1, 'month', lastDateTs);
	} else if (dataLength <= 360) {
		return getDateTicks(firstDateTs, 2, 'month', lastDateTs);
	} else {
		return getDateTicks(firstDateTs, 3, 'month', lastDateTs);
	}
};

const CUSTOM_LINE_COLORS_ID = 'custom-line-colors';
const CUSTOM_AREA_COLORS_ID = 'custom-area-colors';
const POSITIVE_GREEN = '#82ca9d';
const NEGATIVE_RED = '#d46d66';

const CustomActiveDot = (props: DotProps & { payload: { y: number } }) => {
	const { cx = 0, cy = 0, payload } = props;

	return (
		<svg
			x={cx - 4}
			y={cy - 4}
			width="8"
			height="8"
			viewBox="0 0 8 8"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle
				cx="4"
				cy="4"
				r="3.5"
				fill={payload.y >= 0 ? POSITIVE_GREEN : NEGATIVE_RED}
				stroke="white"
			/>
		</svg>
	);
};

export default function PerformanceGraph({
	data,
	marketIndex,
	isPnl,
}: {
	data: {
		x: number;
		y: number;
	}[];
	marketIndex: number;
	isPnl: boolean;
}) {
	const minX = data.reduce((acc, curr) => Math.min(acc, curr.x), Infinity);
	const maxX = data.reduce((acc, curr) => Math.max(acc, curr.x), -Infinity);
	const xDomain = [minX, maxX];

	const minY = data.reduce((acc, curr) => Math.min(acc, curr.y), Infinity);
	const maxY = data.reduce((acc, curr) => Math.max(acc, curr.y), -Infinity);
	const yDomain = getYDomain(minY, maxY);

	const isUsdcAsset = marketIndex === USDC_MARKET.marketIndex;

	/**
	 * The color of the area under the graph/line of graph works as such:
	 *
	 * The highest point (y-axis) of the graph is 0%, the lowest point is 100%.
	 * We set the colors to change at X% of the height of the graph.
	 * Since we want the colors to change at the x-axis ($0), we find
	 * the percentage of the graph from the top of the graph to the x-axis,
	 * and set the colors to change at this offset.
	 */
	const getAreaStops = (endOpacity = 1) => {
		const max = data.reduce((acc, curr) => Math.max(acc, curr.y), -Infinity);
		const min = data.reduce((acc, curr) => Math.min(acc, curr.y), Infinity);

		if (min >= 0) {
			return (
				<>
					<stop offset="0%" stopColor={POSITIVE_GREEN} stopOpacity={1} />
					<stop
						offset="100%"
						stopColor={POSITIVE_GREEN}
						stopOpacity={endOpacity}
					/>
				</>
			);
		}

		if (max <= 0) {
			return (
				<>
					<stop offset="0%" stopColor={NEGATIVE_RED} stopOpacity={endOpacity} />
					<stop offset="100%" stopColor={NEGATIVE_RED} stopOpacity={1} />
				</>
			);
		}

		const zeroOffset = (max / (max - min)) * 100;

		return (
			<>
				<stop offset="0%" stopColor={POSITIVE_GREEN} stopOpacity={1} />
				<stop
					offset={`${zeroOffset}%`}
					stopColor={POSITIVE_GREEN}
					stopOpacity={endOpacity}
				/>
				<stop
					offset={`${zeroOffset}%`}
					stopColor={NEGATIVE_RED}
					stopOpacity={endOpacity}
				/>
				<stop offset="100%" stopColor={NEGATIVE_RED} stopOpacity={1} />
			</>
		);
	};

	function getYDomain(minY: number, maxY: number) {
		if (minY >= 0) {
			const difference = maxY - minY;
			const offset = difference * 2; // make the curve look less steep
			const absoluteMinY = Math.max(minY - offset, 0); // shouldn't go below 0

			return [absoluteMinY, 'auto'];
		}

		return [minY, 'auto'];
	}

	return (
		<ResponsiveContainer width={'100%'} height={320}>
			<AreaChart data={data}>
				<defs>
					<linearGradient
						id={CUSTOM_LINE_COLORS_ID}
						x1="0"
						y1="0"
						x2="0"
						y2="1"
					>
						{getAreaStops(1)}
					</linearGradient>
				</defs>
				<defs>
					<linearGradient
						id={CUSTOM_AREA_COLORS_ID}
						x1="0"
						y1="0"
						x2="0"
						y2="1"
					>
						{getAreaStops(0.2)}
					</linearGradient>
				</defs>
				<Area
					type="monotone"
					dataKey="y"
					stroke={`url(#${CUSTOM_LINE_COLORS_ID})`}
					fill={`url(#${CUSTOM_AREA_COLORS_ID})`}
					strokeWidth={2}
					dot={false}
					/* @ts-ignore */
					activeDot={<CustomActiveDot />}
				/>
				<CartesianGrid stroke="#32D7D720" />
				<XAxis
					tickCount={40}
					type="number"
					dataKey={'x'}
					domain={xDomain}
					tickFormatter={(tick) => dayjs.unix(tick).format('DD/MM')}
					ticks={getCustomXAxisTicks(
						data.length,
						data[0].x,
						data.slice(-1)[0].x
					)}
					tickMargin={8}
				/>
				<YAxis
					tickFormatter={(tick: number) =>
						`${isUsdcAsset ? '$' : ''}${BigNum.from(
							tick,
							Config.spotMarketsLookup[marketIndex].precisionExp
						).toMillified()}`
					}
					tickMargin={8}
					// @ts-ignore
					domain={yDomain}
				/>
				<Tooltip
					content={(props) => (
						/* @ts-ignore */
						<CustomTooltip {...props} marketIndex={marketIndex} isPnl={isPnl} />
					)}
					cursor={{ stroke: '#32D7D740' }}
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
}
