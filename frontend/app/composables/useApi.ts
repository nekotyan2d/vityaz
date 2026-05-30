import createClient from "openapi-fetch";
import type { paths } from "~/api/types";

const API_BASE_URL = "http://localhost:8000";

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession() {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: "POST",
                credentials: "include",
            });

            return response.ok;
        })().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
}

export function useApi() {
    const ssrCookies = import.meta.server ? useRequestHeaders(["cookie"]) : {};

    const client = createClient<paths>({
        baseUrl: API_BASE_URL,
        fetch: async (input: Request) => {
            const request = input.clone();
            const response = await fetch(request);

            const isAuthEndpoint = input.url.includes("/auth/login") || input.url.includes("/auth/register") || input.url.includes("/auth/refresh");

            if (response.status !== 401 || isAuthEndpoint) {
                return response;
            }

            const refreshed = await refreshSession();

            if (!refreshed) {
                return response;
            }

            return fetch(input.clone());
        },
    });

    client.use({
        onRequest({ request }) {
            const headers = new Headers(request.headers);
            if (import.meta.server && ssrCookies.cookie) {
                headers.set("cookie", ssrCookies.cookie);
            }
            return new Request(request, { credentials: "include", headers });
        },
        async onResponse({ response }) {
            if (!response.ok) {
                const body = await response.clone().json().catch(() => ({}));
                throw new Error(body?.message ?? `HTTP ${response.status}`);
            }
        },
    });

    return client;
}
