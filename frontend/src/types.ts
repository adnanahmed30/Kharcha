export const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"] as const;
export type Currency = (typeof CURRENCIES)[number];
export const CATEGORIES = ["Food", "Transport", "Rent", "Shopping", "Bills", "Health", "Entertainment", "Other"] as const;
export type Category = (typeof CATEGORIES)[number];
export function isCategory(value: string | null): value is Category{
    return value != null && (CATEGORIES as readonly string[]).includes(value);
}

export interface ExpenseIn{
    amount_minor: number;
    currency: Currency;
    category: Category;
    note: string | null;
    spent_on: string;
}


export interface ExpenseOut extends ExpenseIn{
    id: number;
    rate: number;
    amount_inr_paise: number;
    created_at: string;
}

export interface CategoryTotal{
    category: Category;
    total_inr_paise: number;
    count: number;
}


export interface SummaryOut{
    month: string;
    total_inr_paise: number;
    count: number;
    by_category: CategoryTotal[];
}


// Body of /auth/register and /auth/login (backend RegisterIn / LoginIn).
export interface Credentials{
    email: string;
    password: string;
}


// Body of /auth/register (backend RegisterIn). Name is 1-50 characters after trimming.
export interface RegisterIn extends Credentials{
    name: string;
}

export const NAME_MAX_LENGTH = 50;


// Backend UserOut. The session token is in an httpOnly cookie, never in JavaScript.
export interface UserOut{
    id: number;
    name: string;
    email: string;
    created_at: string;
}