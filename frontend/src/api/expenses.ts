import type { ExpenseIn, ExpenseOut, SummaryOut } from "../types";

const API_BASE_URL = "http://127.0.0.1:8000/api";


async function getErrorMessage(response: Response): Promise<string> {
    try {
        const data = await response.json();
        const detail = data.detail;
        if (typeof detail === "string") return detail;
        // Pydantic prefixes messages from custom validators with "Value error, ".
        if (Array.isArray(detail)) return detail[0].msg.replace(/^Value error, /, "");
    } catch { }

    return "Something went wrong!";
}


// fetch() only throws when the request never reaches the server
// (backend not running, no network); turn that into a readable message.
async function send(url: string, init?: RequestInit): Promise<Response> {
    try {
        return await fetch(url, init);
    } catch {
        throw new Error("Can't reach the server. Is the backend running?");
    }
}



export async function createExpense(input: ExpenseIn): Promise<ExpenseOut> {
    const response = await send(`${API_BASE_URL}/expenses`, {
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
    const url = query ? `${API_BASE_URL}/expenses?${params}` : `${API_BASE_URL}/expenses`;
    const response = await send(url);
    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }

    return response.json();
}


export async function getSummary(month: string): Promise<SummaryOut> {
    const params = new URLSearchParams();
    params.set("month", month);
    const url = `${API_BASE_URL}/summary?${params}`;
    const response = await send(url);
    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }

    return response.json();
}


export async function updateExpense(id: number, changes: Partial<ExpenseIn>): Promise<ExpenseOut> {
    const response = await send(`${API_BASE_URL}/expenses/${id}`, {
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
    const response = await send(`${API_BASE_URL}/expenses/${id}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }
}


export async function getExpense(id: number): Promise<ExpenseOut> {
    const response = await send(`${API_BASE_URL}/expenses/${id}`, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }
    return response.json();
}