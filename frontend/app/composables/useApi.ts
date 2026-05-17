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
    const client = createClient<paths>({
        baseUrl: API_BASE_URL,
        fetch: async (input: Request) => {
            const request = input.clone();
            const response = await fetch(request);

            const isAuthEndpoint = request.url.includes("/auth/login") || request.url.includes("/auth/register") || request.url.includes("/auth/refresh");

            if (response.status !== 401 || isAuthEndpoint) {
                return response;
            }

            const refreshed = await refreshSession();

            if (!refreshed) {
                return response;
            }

            return fetch(request.clone());
        },
    });

    client.use({
        onRequest({ request }) {
            return new Request(request, {
                credentials: "include",
            });
        },
    });

    return client;
}
