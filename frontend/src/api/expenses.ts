import type { ExpenseIn, ExpenseOut, SummaryOut } from "../types";
import { getErrorMessage, send } from "./client";


export async function createExpense(input: ExpenseIn): Promise<ExpenseOut> {
    const response = await send("/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }

    return response.json();
}


export async function listExpenses(filters: { month: string | null; category: string | null }): Promise<ExpenseOut[]> {
    const { month, category } = filters;
    const params = new URLSearchParams();
    if (month) params.set("month", month);
    if (category) params.set("category", category);
    const query = params.toString();
    const path = query ? `/expenses?${query}` : "/expenses";
    const response = await send(path);
    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }

    return response.json();
}


export async function getSummary(month: string): Promise<SummaryOut> {
    const params = new URLSearchParams();
    params.set("month", month);
    const response = await send(`/summary?${params}`);
    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }

    return response.json();
}


export async function updateExpense(id: number, changes: Partial<ExpenseIn>): Promise<ExpenseOut> {
    const response = await send(`/expenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }

    return response.json();
}


export async function deleteExpense(id: number): Promise<void> {
    const response = await send(`/expenses/${id}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }
}


export async function getExpense(id: number): Promise<ExpenseOut> {
    const response = await send(`/expenses/${id}`);

    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }
    return response.json();
}
