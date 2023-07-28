import { PublicKey } from '@solana/web3.js';
import { usePathname } from 'next/navigation';

import { DEFAULT_VAULT_PUBKEY } from '@/constants/vaults';
import { useMemo } from 'react';

const getVaultPubKey = (pathname: string) => {
	const firstPath = pathname.split('/')[1];
	const possibleVaultAddress = pathname.split('/')[2];

	if (firstPath === '') {
		return DEFAULT_VAULT_PUBKEY;
	} else if (firstPath === 'vault') {
		try {
			return new PublicKey(possibleVaultAddress);
		} catch (err) {
			return undefined;
		}
	} else {
		return undefined;
	}
};

export default function usePathToVaultPubKey() {
	const pathname = usePathname();

	const vaultPubKey = useMemo(() => getVaultPubKey(pathname), [pathname]);

	return vaultPubKey;
}
