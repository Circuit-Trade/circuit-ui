import { useState } from 'react';

import ButtonTabs from '@/components/elements/ButtonTabs';

import { BalancesTable } from './BalancesTable';

const VAULT_TABLE_TABS = ['Balances', 'Positions'];

export const VaultTable = () => {
	const [selectedTab, setSelectedTab] = useState(VAULT_TABLE_TABS[0]);

	return (
		<div className="flex flex-col w-full">
			<div>
				<ButtonTabs
					tabs={VAULT_TABLE_TABS.map((tab) => ({
						label: tab,
						selected: selectedTab === tab,
						onSelect: () => setSelectedTab(tab),
					}))}
					// className="border-b-0"
					tabClassName="p-1"
				/>
			</div>
			<BalancesTable />
		</div>
	);
};
