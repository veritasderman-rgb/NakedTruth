// Signal raised by the RPC / server actions when a tier_2 round is requested
// without an active entitlement. The client catches it and opens checkout.
export const PAYWALL_ERROR = 'PAYWALL';
