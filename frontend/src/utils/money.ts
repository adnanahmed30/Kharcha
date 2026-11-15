import type { Currency } from "../types";




const inrFormatter = new Intl.NumberFormat("en-IN", {style: "currency", currency: "INR"});


export function formatPaise(paise: number): string{
    const rupees = paise / 100;
    return inrFormatter.format(rupees);
}



export function formatAmount(amountMinor: number, currency: Currency): string{
    const amountMajor = amountMinor / 100;
    const amountFormatter = new Intl.NumberFormat("en-IN", {style: "currency", currency});
    return amountFormatter.format(amountMajor);
}


// Must match the le=1_000_000_000 limit on amount_minor in backend/app/schemas.py.
export const MAX_AMOUNT_MINOR = 1_000_000_000;


export function toMinorUnits(inputamount: string): number | null{
    const amount = Number(inputamount);
    const amountMinor = Math.round(amount * 100);
    // isFinite rejects NaN as well as "Infinity", which isNaN let through.
    if(!Number.isFinite(amount)  ||  amountMinor<= 0) return null;
    return amountMinor;
}


export function toInputText(amountMinor: number): string{
    const amountMajor = amountMinor / 100;
    return amountMajor.toFixed(2);
}