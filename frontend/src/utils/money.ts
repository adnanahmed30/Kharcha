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


export function toMinorUnits(inputamount: string): number | null{
    const amount = Number(inputamount);
    const amountMinor = Math.round(amount * 100);
    if(Number.isNaN(amount)  ||  amountMinor<= 0) return null;
    return amountMinor;
}


export function toInputText(amountMinor: number): string{
    const amountMajor = amountMinor / 100;
    return amountMajor.toFixed(2);
}