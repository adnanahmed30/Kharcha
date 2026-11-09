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