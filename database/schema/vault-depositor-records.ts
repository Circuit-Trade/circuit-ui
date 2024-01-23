import { InferSelectModel } from 'drizzle-orm';
import { index, integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';

import { createBNField, createPubkeyField } from '../utils';

export const vault_depositor_records = pgTable(
	'vault_depositor_records',
	{
		id: serial('id').primaryKey(),
		vault: createPubkeyField('vault'),
		depositorAuthority: createPubkeyField('depositorAuthority'),
		action: varchar('action', { length: 32 }).notNull().default(''),
		amount: createBNField('amount'),
		spotMarketIndex: integer('spotMarketIndex').notNull(),
		vaultSharesBefore: createBNField('vaultSharesBefore'),
		vaultSharesAfter: createBNField('vaultSharesAfter'),
		vaultEquityBefore: createBNField('vaultEquityBefore'),
		userVaultSharesBefore: createBNField('userVaultSharesBefore'),
		totalVaultSharesBefore: createBNField('totalVaultSharesBefore'),
		userVaultSharesAfter: createBNField('userVaultSharesAfter'),
		totalVaultSharesAfter: createBNField('totalVaultSharesAfter'),
		profitShare: createBNField('profitShare'),
		managementFee: createBNField('managementFee'),
		managementFeeShares: createBNField('managementFeeShares'),
	},
	(t) => {
		return {
			vault: index('vault').on(t.vault),
			vaultDepositor: index('vaultDepositor').on(t.vault, t.depositorAuthority),
		};
	}
);

export type SerializedVaultDepositorRecord = InferSelectModel<
	typeof vault_depositor_records
>;
