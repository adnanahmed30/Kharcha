// Shared plumbing for every backend call. Only files in src/api/ should use this.

// Relative URL: the Vite dev server proxies /api to the backend (see vite.config.ts).
const API_BASE_URL = "/api";


let onUnauthorized: (() => void) | null = null;

// AuthProvider registers this so any 401 (expired or missing session) logs the user out in the UI.
export function setUnauthorizedHandler(handler: (() => void) | null): void {
    onUnauthorized = handler;
}


export async function getErrorMessage(response: Response): Promise<string> {
    try {
        const data = await response.json();
        const detail = data.detail;
        if (typeof detail === "string") return detail;
        // Pydantic prefixes messages from custom validators with "Value error, ".
        if (Array.isArray(detail)) return detail[0].msg.replace(/^Value error, /, "");
    } catch { }

    return "Something went wrong!";
}


const SERVER_DOWN_MESSAGE = "Can't reach server";

export async function send(path: string, init?: RequestInit): Promise<Response> {
    let response: Response;
    try {
        // "same-origin" sends the httpOnly session cookie; JavaScript never sees the token itself.
        response = await fetch(`${API_BASE_URL}${path}`, { credentials: "same-origin", ...init });
    } catch {
        throw new Error(SERVER_DOWN_MESSAGE);
    }

    // With the backend stopped, the Vite proxy answers with a 5xx that isn't JSON.
    const isJson = response.headers.get("content-type")?.includes("application/json") ?? false;
    if (response.status >= 500 && !isJson) {
        throw new Error(SERVER_DOWN_MESSAGE);
    }

    if (response.status === 401) onUnauthorized?.();
    return response;
}
