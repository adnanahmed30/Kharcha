import type { Credentials, RegisterIn, UserOut } from "../types";
import { getErrorMessage, send } from "./client";


async function postCredentials(path: string, credentials: Credentials | RegisterIn): Promise<UserOut> {
    const response = await send(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }

    return response.json();
}


export function register(input: RegisterIn): Promise<UserOut> {
    return postCredentials("/auth/register", input);
}


export function login(credentials: Credentials): Promise<UserOut> {
    return postCredentials("/auth/login", credentials);
}


export async function logout(): Promise<void> {
    const response = await send("/auth/logout", { method: "POST" });
    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }
}


// null means "not logged in" (no cookie, or it expired).
export async function getCurrentUser(): Promise<UserOut | null> {
    const response = await send("/auth/me");
    if (response.status === 401) return null;
    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }
    return response.json();
}
