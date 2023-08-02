import { PublicKey } from '@drift-labs/sdk';

export const TEST_VAULT_PUBKEY = new PublicKey(
	'BxDh8x17Bf3pDf17uh65kXCwmdMpdNjTj91hVqkmFpAp'
);

export interface UiVaultConfig {
	name: string;
	pubkey: PublicKey;
	description: string;
	comingSoon?: boolean;
	permissioned?: boolean;
	previewBackdropUrl?: string;
}

export const VAULTS: UiVaultConfig[] = [
	{
		name: 'Supercharger',
		pubkey: TEST_VAULT_PUBKEY,
		description: 'Delta-neutral market making strategy',
		permissioned: true,
		previewBackdropUrl: '/blue-preview-backdrop.png',
	},
	{
		name: 'Turbocharger',
		pubkey: new PublicKey('2bXtK9phuqUbqsmonWCNYcV87DkFmqyRiDqGen4daZwx'),
		description: 'Delta-neutral market making strategy',
		comingSoon: true,
		previewBackdropUrl: '/blue-preview-backdrop.png',
	},
	{
		name: 'Delta Neutral DLP',
		pubkey: new PublicKey('B4LBd4DEKZZLvkn7eazUf7xU9RuTpvxH4th18VgVzMpB'),
		description: 'Hedged Drift Liquidity Provider (DLP) strategy',
		comingSoon: true,
		previewBackdropUrl: '/blue-preview-backdrop.png',
	},
];
