import { MockBillingProvider } from './mock';
import type { BillingProvider } from './provider';

export type { BillingProvider, TierInfo } from './provider';
export { TIERS } from './provider';

// Troca de provider (Fase PAG) acontece SÓ aqui.
export const billing: BillingProvider = new MockBillingProvider();
