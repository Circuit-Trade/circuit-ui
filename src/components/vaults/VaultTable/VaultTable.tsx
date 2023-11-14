import { useState } from 'react';

import ButtonTabs from '@/components/elements/ButtonTabs';

import { BalancesTable } from './BalancesTable';
import { PositionsTable } from './PositionsTable';

const VAULT_TABLE_TABS = ['Positions', 'Balances'];

export const VaultTable = () => {
	const [selectedTab, setSelectedTab] = useState(VAULT_TABLE_TABS[0]);

	const renderTable = () => {
		switch (selectedTab) {
			case 'Balances':
			default:
				return <BalancesTable />;
			case 'Positions':
				return <PositionsTable />;
		}
	};

	return (
		<div className="flex flex-col w-full">
			<div>
				<ButtonTabs
					tabs={VAULT_TABLE_TABS.map((tab) => ({
						label: tab,
						selected: selectedTab === tab,
						onSelect: () => setSelectedTab(tab),
					}))}
					tabClassName="p-1"
				/>
			</div>
			{renderTable()}
		</div>
	);
};
