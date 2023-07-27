import { useCommonDriftStore, useDriftClientIsReady } from '@drift-labs/react';
import { PublicKey } from '@drift-labs/sdk';
import { UISnapshotHistory } from '@drift/common';
import axios from 'axios';
import { useEffect, useRef } from 'react';

import NOTIFICATION_UTILS from '@/utils/notifications';

import Env from '@/constants/environment';

import { useAppActions } from './useAppActions';
import useAppStore from './useAppStore';
import useCurrentVaultAccount from './useCurrentVaultAccount';
import usePathToVaultPubKey from './usePathToVaultName';

/**
 * Fetches
 * - Vault account
 * - Vault's Drift User account
 * - Vault Depositor
 */
export default function useFetchVault() {
	const driftClientIsReady = useDriftClientIsReady();
	const appActions = useAppActions();
	const vaultPubKey = usePathToVaultPubKey();
	const authority = useCommonDriftStore((s) => s.authority);
	const setAppStore = useAppStore((s) => s.set);
	const vaultAccount = useCurrentVaultAccount();

	const initialVaultSnapshotFetched = useRef(false);

	useEffect(() => {
		if (!initialVaultSnapshotFetched.current && vaultAccount && vaultPubKey) {
			fetchVaultSnapshots(vaultAccount.user, vaultPubKey).then(() => {
				initialVaultSnapshotFetched.current = true;
			});
		}
	}, [!!vaultAccount, vaultPubKey]);

	useEffect(() => {
		if (driftClientIsReady && vaultPubKey) {
			fetchAllVaultInformation(vaultPubKey);
		}
	}, [driftClientIsReady, vaultPubKey]);

	useEffect(() => {
		if (vaultPubKey && authority && vaultAccount) {
			appActions.initVaultDepositorSubscriber(vaultPubKey, authority);
		}
	}, [vaultPubKey, authority, !!vaultAccount]);

	const fetchAllVaultInformation = async (vaultPubKey: PublicKey) => {
		try {
			await appActions.fetchVault(vaultPubKey);
			appActions.fetchVaultStats(vaultPubKey);
		} catch (err) {
			console.error(err);
			NOTIFICATION_UTILS.toast.error('Error fetching vault data');
		}
	};

	const fetchVaultSnapshots = async (
		userAccount: PublicKey,
		vaultPubKey: PublicKey
	) => {
		const res = await axios.get<{ data: UISnapshotHistory[] }>(
			`${
				Env.historyServerUrl
			}/userSnapshots/?userPubKeys=${userAccount.toString()}`
		);

		const snapshots = res.data.data;

		setAppStore((s) => {
			s.vaults[vaultPubKey.toString()]!.pnlHistory = snapshots[0];
		});
	};
}
