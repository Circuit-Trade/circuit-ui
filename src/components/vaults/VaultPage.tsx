'use client';

import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import DepositWithdrawForm from '@/components/vaults/DepositWithdrawForm';
import VaultHero from '@/components/vaults/VaultHero';
import VaultOverview from '@/components/vaults/VaultOverview';
import VaultPerformance from '@/components/vaults/VaultPerformance';
import VaultTabs, { VaultTab } from '@/components/vaults/VaultTabs';
import WhiteGloveDetails from '@/components/vaults/WhiteGloveDetails';
import YourPerformance from '@/components/vaults/YourPerformance';

import useCurrentVaultAccountData from '@/hooks/useCurrentVaultAccountData';

import FadeInDiv from '../elements/FadeInDiv';

export default function VaultPage() {
	const [selectedTab, setSelectedTab] = useState<VaultTab>(
		VaultTab.VaultPerformance
	);
	const vaultAccountData = useCurrentVaultAccountData();

	const isLoading = !vaultAccountData;

	const renderLeftPanel = () => {
		switch (selectedTab) {
			case VaultTab.VaultPerformance:
			default:
				return <VaultPerformance />;
			case VaultTab.UserPerformance:
				return <YourPerformance />;
			case VaultTab.Overview:
				return <VaultOverview />;
		}
	};

	return (
		<div>
			{isLoading && (
				<div className="flex flex-col items-center justify-center w-full h-[80vh] gap-4">
					<div className="animate-pulse">
						<Image
							src="/circuits-icon.svg"
							alt="Circuits Icon"
							width="60"
							height="66"
						/>
					</div>
					<div className="loading">
						Loading Vault<span>.</span>
						<span>.</span>
						<span>.</span>
					</div>
				</div>
			)}
			<div
				className={twMerge(
					'flex flex-col items-center w-full px-2',
					isLoading ? 'h-0 overflow-hidden' : 'h-auto'
				)}
			>
				<FadeInDiv
					className={'flex flex-col items-center w-full'}
					fadeCondition={!isLoading}
				>
					<VaultHero />
					<VaultTabs
						selectedTab={selectedTab}
						setSelectedTab={setSelectedTab}
					/>
				</FadeInDiv>
				<FadeInDiv
					delay={200}
					className={twMerge(
						'flex justify-between w-full gap-10 md:gap-16 mt-8 md:mt-16 lg:gap-[130px] flex-col md:flex-row'
					)}
					fadeCondition={!isLoading}
				>
					<div className="max-w-[580px] w-full [&>div]:p-1">
						{renderLeftPanel()}
					</div>
					<div className="flex flex-col gap-7 max-w-[456px] min-w-[340px]">
						<DepositWithdrawForm />
						<WhiteGloveDetails />
					</div>
				</FadeInDiv>
			</div>
		</div>
	);
}