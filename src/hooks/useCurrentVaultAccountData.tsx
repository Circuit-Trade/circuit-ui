import useAppStore from '../stores/app/useAppStore';
import usePathToVaultPubKey from './usePathToVaultName';

export default function useCurrentVaultAccountData() {
	const currentVaultPubKey = usePathToVaultPubKey();
	const vaultAccount = useAppStore((s) =>
		s.getVaultAccountData(currentVaultPubKey)
	);
	return vaultAccount;
}
