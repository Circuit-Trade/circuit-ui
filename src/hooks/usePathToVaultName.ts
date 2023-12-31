import { PublicKey } from '@solana/web3.js';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { encodeVaultName } from '@/utils/utils';

import { VAULTS } from '@/constants/vaults';

const getVaultPubKey = (pathname: string): PublicKey | undefined => {
	const firstPath = pathname.split('/')[1];
	const possibleVaultAddressOrName = pathname.split('/')[2];

	if (!firstPath || firstPath !== 'vault') {
		return undefined;
	}

	try {
		const foundVaultUsingName = VAULTS.find(
			(vault) =>
				encodeVaultName(vault.name) === possibleVaultAddressOrName.toLowerCase()
		);

		if (foundVaultUsingName?.pubkeyString) {
			return new PublicKey(foundVaultUsingName.pubkeyString);
		}

		return new PublicKey(possibleVaultAddressOrName);
	} catch (err) {
		// catch error from PublicKey constructor
		return undefined;
	}
};

export default function usePathToVaultPubKey() {
	const pathname = usePathname();

	const vaultPubKey = useMemo(() => getVaultPubKey(pathname), [pathname]);

	return vaultPubKey;
}
