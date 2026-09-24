/** Market rahn→rent conversion: ~3% per month (1M deposit ≈ 30k monthly rent). */
export const RAHN_RATE = 0.03

export const equivalentRent = (deposit = 0, rent = 0, rate = RAHN_RATE) => Math.round(rent + deposit * rate)

/** Given a total equivalent rent, how much monthly rent remains for a chosen deposit. */
export const rentForDeposit = (equiv: number, deposit: number, rate = RAHN_RATE) => Math.max(0, Math.round(equiv - deposit * rate))
