import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Badge from '@/components/elements/Badge';
import ButtonTabs from '@/components/elements/ButtonTabs';

import { useCurrentVault } from '@/hooks/useVault';

import { BalancesTable } from './BalancesTable';
import { OpenOrdersTable } from './OpenOrdersTable';
import { OpenPositionsTable } from './OpenPositionsTable';

export const VaultTable = () => {
	const accountSummary = useCurrentVault()?.accountSummary;
	const numOfOpenPositions = accountSummary?.openPositions.length ?? 0;
	const numOfOpenOrders = accountSummary?.openOrders.length ?? 0;
	const numOfBalances = accountSummary?.balances.length ?? 0;

	const VAULT_TABLE_TABS = [
		{ label: 'Balances', numOfData: numOfBalances },
		{ label: 'Positions', numOfData: numOfOpenPositions },
		{ label: 'Orders', numOfData: numOfOpenOrders },
	];

	const [selectedTab, setSelectedTab] = useState(VAULT_TABLE_TABS[0].label);

	const renderTable = () => {
		switch (selectedTab) {
			case 'Balances':
			default:
				return <BalancesTable />;
			case 'Positions':
				return <OpenPositionsTable />;
			case 'Orders':
				return <OpenOrdersTable />;
		}
	};

	return (
		<div className="flex flex-col w-full max-w-full">
			<div className="max-w-full border border-container-border">
				<ButtonTabs
					tabs={VAULT_TABLE_TABS.map((tab) => ({
						key: tab.label,
						label: (
							<div className="flex items-center justify-center gap-2 group">
								<span>{tab.label}</span>
								<Badge
									className={twMerge(
										'py-0 text-xs bg-transparent border border-main-blue text-text-secondary group-hover:text-black group-hover:border-black transition-all',
										selectedTab === tab.label && 'bg-main-blue text-black'
									)}
								>
									{tab.numOfData}
								</Badge>
							</div>
						),
						selected: selectedTab === tab.label,
						onSelect: () => setSelectedTab(tab.label),
					}))}
					tabClassName="p-1 w-auto px-3 sm:px-8"
					className="max-w-full -m-[1px]"
				/>
			</div>
			{renderTable()}
		</div>
	);
};
