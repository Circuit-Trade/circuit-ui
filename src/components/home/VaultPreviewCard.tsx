'use client';

import useAppStore from '@/stores/app/useAppStore';
import { UiVaultConfig } from '@/types';
import { useCommonDriftStore } from '@drift-labs/react';
import { BN, BigNum } from '@drift-labs/sdk';
import { USDC_SPOT_MARKET_INDEX } from '@drift/common';
import { PublicKey } from '@solana/web3.js';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useWindowSize } from 'react-use';
import { twMerge } from 'tailwind-merge';

import { useAppActions } from '@/hooks/useAppActions';
import { useVault } from '@/hooks/useVault';
import { useVaultStats } from '@/hooks/useVaultStats';

import { encodeVaultName } from '@/utils/utils';
import { getModifiedDietzApy, getUiVaultConfig } from '@/utils/vaults';

import { USDC_MARKET } from '@/constants/environment';
import { sourceCodePro, syne } from '@/constants/fonts';

import Badge from '../elements/Badge';
import Button from '../elements/Button';
import MarketIcon from '../elements/MarketIcon';
import { Lock } from '../icons';
import Particles from './Particles';

function VaultStat({
	label,
	value,
	loading,
}: {
	label: string;
	value: string;
	loading: boolean;
}) {
	return (
		<div className="flex flex-col text-center">
			<span>{label}</span>
			{loading ? (
				<Skeleton />
			) : (
				<span
					className={twMerge(
						sourceCodePro.className,
						'transition-all  md:text-2xl group-hover:md:text-2xl text-xl group-hover:text-lg'
					)}
				>
					{value}
				</span>
			)}
		</div>
	);
}

interface VaultStatsProps {
	apy: string;
	tvl: string;
	userBalance?: string;
	capacity: number;
	loading: boolean;
	assetLabel: string;
}

function VaultStats({
	apy,
	tvl,
	capacity,
	loading,
	userBalance,
	assetLabel,
}: VaultStatsProps) {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	return (
		<div className="flex flex-col w-full gap-4">
			<div className="flex justify-between w-full">
				<VaultStat label={'APY'} value={apy} loading={loading} />
				{!!userBalance && (
					<VaultStat
						label={`Your Balance${assetLabel ? ` (${assetLabel})` : ''}`}
						value={`${assetLabel ? '' : '$'}${userBalance}`}
						loading={loading}
					/>
				)}
				<VaultStat
					label={`TVL${assetLabel ? ` (${assetLabel})` : ''}`}
					value={`${assetLabel ? '' : '$'}${tvl}`}
					loading={loading}
				/>
				<VaultStat
					label={`Capacity`}
					value={`${capacity.toFixed(2)}%`}
					loading={loading}
				/>
			</div>
			<div className="h-2 border">
				<div
					style={{
						width: isMounted && capacity > 0 ? `${capacity}%` : '0%',
					}}
					className={twMerge(
						'h-full blue-white-gradient-background transition-[width] duration-1000',
						capacity !== 100 && 'border-r'
					)}
				/>
			</div>
		</div>
	);
}

const CardContainer = ({
	children,
	comingSoon,
	handleMouseEnter,
	handleMouseLeave,
	vaultName,
	hue,
}: {
	children: React.ReactNode;
	comingSoon: boolean;
	handleMouseEnter: () => void;
	handleMouseLeave: () => void;
	vaultName: string;
	hue: number;
}) => {
	if (comingSoon) {
		return (
			<div
				className={
					'relative flex flex-col flex-1 w-full border cursor-pointer border-container-border group card-hover-border-glow'
				}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				// @ts-ignore
				style={{ '--hue': hue }}
			>
				{children}
			</div>
		);
	}

	return (
		<Link
			href={`/vault/${encodeVaultName(vaultName)}`}
			className={
				'relative flex flex-col flex-1 w-full border cursor-pointer border-container-border group card-hover-border-glow'
			}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			// @ts-ignore
			style={{ '--hue': hue }}
		>
			{children}
		</Link>
	);
};

interface VaultPreviewCardProps {
	vault: UiVaultConfig;
}

export default function VaultPreviewCard({ vault }: VaultPreviewCardProps) {
	const { width } = useWindowSize();
	const [connection, authority] = useCommonDriftStore((s) => [
		s.connection,
		s.authority,
	]);
	const appActions = useAppActions();

	const vaultPubkey = useMemo(
		() => (vault.pubkeyString ? new PublicKey(vault.pubkeyString) : undefined),
		[vault.pubkeyString]
	);
	const vaultStore = useVault(vaultPubkey);
	const [vaultAccountData, vaultDepositorAccountData] = useAppStore((s) => [
		s.getVaultAccountData(vaultPubkey),
		s.getVaultDepositorAccountData(vaultPubkey),
	]);
	const uiVaultConfig = getUiVaultConfig(vaultPubkey);
	const spotMarketConfig = uiVaultConfig?.market ?? USDC_MARKET;

	const vaultStats = useVaultStats(vaultPubkey);

	const [isHover, setIsHover] = useState(false);

	const tvl = vaultStats.totalAccountBaseValue;
	const maxCapacity = vaultAccountData?.maxTokens ?? new BN(1);
	const capacityPct = Math.min(
		(tvl.toNumber() / maxCapacity.toNumber()) * 100,
		100
	);
	const apy = getModifiedDietzApy(
		BigNum.from(
			vaultStats.totalAccountBaseValue,
			spotMarketConfig.precisionExp
		).toNum(),
		vaultStore?.vaultDeposits ?? []
	);

	// TODO: abstract this logic
	// User's vault share proportion
	const totalVaultShares = vaultAccountData?.totalShares.toNumber() ?? 0;
	const userVaultShares =
		vaultDepositorAccountData?.vaultShares.toNumber() ?? 0;
	const userSharesProportion = userVaultShares / (totalVaultShares ?? 1) || 0;

	// User's net deposits
	const vaultAccountBaseBalance = vaultStats.totalAccountBaseValue.toNumber();
	const userAccountBalanceProportion =
		vaultAccountBaseBalance * userSharesProportion;
	const userAccountBalanceProportionBigNum = BigNum.from(
		userAccountBalanceProportion,
		spotMarketConfig.precisionExp
	);
	const userAccountValueString =
		userAccountBalanceProportionBigNum.toMillified();

	// UI variables
	const assetLabel =
		spotMarketConfig.marketIndex === USDC_SPOT_MARKET_INDEX
			? ''
			: spotMarketConfig.symbol;
	const comingSoon = !vault.pubkeyString || !!uiVaultConfig?.comingSoon;

	// fetch vault account data
	useEffect(() => {
		if (vaultPubkey && connection) {
			appActions.fetchVault(vaultPubkey);
		}
	}, [vault.pubkeyString, connection]);

	// fetch vault depositor account data
	useEffect(() => {
		if (vaultPubkey && authority && vaultAccountData) {
			appActions.initVaultDepositorSubscriber(vaultPubkey, authority);
		}
	}, [vaultPubkey, authority, !!vaultAccountData]);

	const topSectionHeight = calculateTopSectionHeight();

	const handleMouseEnter = () => {
		setIsHover(true);
	};

	const handleMouseLeave = () => {
		setIsHover(false);
	};

	function calculateTopSectionHeight() {
		const maxHeight = 120;
		let viewportWidth;

		if (width < 768) {
			viewportWidth = 20;
		} else {
			viewportWidth = 10;
		}

		return Math.round(Math.min((viewportWidth * width) / 100, maxHeight));
	}

	function hexToHue(hex: string) {
		let r = parseInt(hex.slice(1, 3), 16) / 255,
			g = parseInt(hex.slice(3, 5), 16) / 255,
			b = parseInt(hex.slice(5, 7), 16) / 255;

		let max = Math.max(r, g, b),
			min = Math.min(r, g, b);
		let h,
			s,
			l = (max + min) / 2;

		if (max === min) {
			h = s = 0; // achromatic
		} else {
			let d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r:
				default:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
			}
			h /= 6;
		}

		return h * 360; // Return hue in degrees
	}

	return (
		<CardContainer
			comingSoon={comingSoon}
			handleMouseEnter={handleMouseEnter}
			handleMouseLeave={handleMouseLeave}
			vaultName={vault.name}
			hue={hexToHue(vault.backdropParticlesColor)}
		>
			{/** Background image (separated to allow isolation of the brightness feature) */}
			<div
				className="absolute inset-0 z-10 transition-all group-hover:brightness-125"
				style={{
					backgroundImage: `url(${vault.previewBackdropUrl})`,
					backgroundSize: 'cover',
				}}
			/>
			{/** Particles on hover */}
			<div className="absolute z-50 flex justify-center w-full">
				<div
					className="w-[80%]"
					style={{
						height: `${topSectionHeight}px`,
					}}
				>
					{isHover && <Particles color={vault.backdropParticlesColor} />}
				</div>
			</div>
			{/** Radial background on hover */}
			<div className="absolute inset-x-0 top-0 transition-all bottom-40 blue-radial-gradient-background group-hover:brightness-200 brightness-0" />

			{/** Main Content */}
			<div
				className="relative z-20 flex flex-col isolate grow"
				style={{ marginTop: `${topSectionHeight}px` }}
			>
				{/** Background blur + grayscale (separated to allow isolation of inner content from grayscale ) */}
				<div className="absolute inset-0 backdrop-blur" />
				<div className="flex flex-col items-center gap-4 px-4 py-4 text-center md:px-8 md:pb-10 md:pt-8 isolate grow">
					<div className="flex flex-col items-center w-full gap-2">
						<span className={twMerge(syne.className, 'text-4xl font-bold')}>
							{vault.name}
						</span>
						<div className="flex flex-col items-center w-full gap-2">
							{/* <span>{vault.description}</span> */}

							<div className="flex items-center">
								<span>Deposit: </span>
								<span>
									{' '}
									<MarketIcon
										key={spotMarketConfig.symbol}
										marketName={spotMarketConfig.symbol}
										className="ml-1"
									/>
								</span>

								<div className="h-4 w-[1px] bg-white mx-2"></div>

								<span>Trading: </span>
								{uiVaultConfig?.assetsOperatedOn && (
									<div className="flex gap-1">
										{uiVaultConfig?.assetsOperatedOn?.map((asset) => {
											return (
												<MarketIcon
													key={asset.market.symbol}
													marketName={asset.market.symbol}
													className="ml-1"
												/>
											);
										})}
									</div>
								)}
							</div>

							{vault.permissioned && (
								<Badge>
									<div className="flex items-center justify-center gap-1 whitespace-nowrap">
										<Lock />
										<span>Whitelist Only</span>
									</div>
								</Badge>
							)}
						</div>
					</div>
					<div className="w-full grow flex flex-col items-center justify-end h-[136px]">
						{comingSoon ? (
							<span
								className={twMerge(
									sourceCodePro.className,
									'text-3xl radial-gradient-text'
								)}
							>
								Coming Soon
							</span>
						) : (
							<div className="flex flex-col items-center justify-end w-full">
								<VaultStats
									apy={`${
										uiVaultConfig?.temporaryApy
											? uiVaultConfig?.temporaryApy
											: ((isNaN(apy) ? 0 : apy) * 100).toFixed(2)
									}%`}
									tvl={BigNum.from(
										tvl,
										spotMarketConfig.precisionExp
									).toMillified()}
									capacity={capacityPct}
									loading={!vaultStats.isLoaded}
									userBalance={
										userAccountBalanceProportionBigNum.eqZero()
											? undefined
											: userAccountValueString
									}
									assetLabel={assetLabel}
								/>
								<div className="overflow-hidden transition-all group-hover:mt-5 w-full group-hover:h-[32px] h-0">
									<Button className={twMerge('py-1 w-full')}>Open Vault</Button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</CardContainer>
	);
}
