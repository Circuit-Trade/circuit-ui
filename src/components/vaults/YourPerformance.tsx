import { BigNum, QUOTE_PRECISION_EXP } from '@drift-labs/sdk';
import { useWallet } from '@solana/wallet-adapter-react';
import { twMerge } from 'tailwind-merge';

import useCurrentVault from '@/hooks/useCurrentVault';

import { sourceCodePro } from '@/constants/fonts';

import ConnectButton from '../ConnectButton';
import SectionHeader from '../SectionHeader';
import BreakdownRow from './BreakdownRow';

const StatsBox = ({ label, value }: { label: string; value: string }) => {
	return (
		<div className="flex flex-col items-center flex-1 gap-1">
			<span
				className={twMerge(
					sourceCodePro.className,
					'text-2xl font-medium text-text-emphasis'
				)}
			>
				{value}
			</span>
			<span className="text-lg">{label}</span>
		</div>
	);
};

export default function YourPerformance() {
	const { connected } = useWallet();
	const vault = useCurrentVault();
	const vaultDepositor = vault?.vaultDepositor;

	// if (!vault || !vaultDepositor) return null;

	const totalVaultShares = vault?.info.totalShares.toNumber();
	const userVaultShares = vaultDepositor?.vaultShares.toNumber();
	const userSharesProportion = userVaultShares / totalVaultShares;

	const userNetDeposits = vaultDepositor?.netDeposits.toNumber();
	const userNetDepositsString = BigNum.from(
		userNetDeposits,
		QUOTE_PRECISION_EXP
	).toNotional();

	const userTotalDeposits = vaultDepositor?.totalDeposits.toNumber();
	const userTotalWithdraws = vaultDepositor?.totalWithdraws.toNumber();
	const vaultAccountBalance = vault?.stats.netUsdValue.toNumber();
	const userAccountBalanceProportion =
		vaultAccountBalance * userSharesProportion;
	const cumulativeEarnings =
		userTotalWithdraws - userTotalDeposits + userAccountBalanceProportion;
	const cumulativeEarningsString = BigNum.from(
		cumulativeEarnings,
		QUOTE_PRECISION_EXP
	).toNotional();

	return (
		<div className={'relative flex flex-col gap-16'}>
			<div>
				<SectionHeader className="mb-9">Summary</SectionHeader>
				<div className="flex items-center justify-center w-full gap-4">
					<StatsBox
						label="Your Deposit"
						value={connected ? userNetDepositsString : '--'}
					/>
					<div className="h-12 border-r border-container-border" />
					<StatsBox
						label="Cumulative Earnings"
						value={connected ? cumulativeEarningsString : '--'}
					/>
				</div>
			</div>
			<div>
				<SectionHeader className="mb-4">Performance Breakdown</SectionHeader>
				<BreakdownRow
					label="Cumulative Earnings"
					value={cumulativeEarningsString}
				/>
				<BreakdownRow label="Your Deposits" value={userNetDepositsString} />
				<BreakdownRow
					label="Vault Share"
					value={`${Number(userSharesProportion.toFixed(6))}%`}
				/>
				<BreakdownRow label="Max Daily Drawdown" value="-3.41%" />
			</div>
			{!connected && (
				<>
					<div className="absolute inset-0 flex flex-col items-center backdrop-blur-sm">
						<ConnectButton className="max-w-[400px] mt-60 h-auto " />
					</div>
				</>
			)}
		</div>
	);
}
