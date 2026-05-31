import createClient from "openapi-fetch";
import type { paths } from "~/api/types";

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(apiUrl: string) {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            const response = await fetch(`${apiUrl}/auth/refresh`, {
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
    const {
        public: { apiUrl },
    } = useRuntimeConfig();
    // TODO: убрать прокси для API и юзать полный URL, когда бэкенд будет отдавать куки с правильными доменами. Сейчас это нужно, чтобы куки работали на сервере (в режиме SSR) и клиенте одновременно:
    // On client: go through Nuxt proxy so Set-Cookie is bound to frontend domain
    // On server: hit backend directly (cookies forwarded manually from incoming request)
    const baseUrl = import.meta.server ? apiUrl : "/api";
    const ssrCookies = import.meta.server ? useRequestHeaders(["cookie"]) : {};

    const client = createClient<paths>({
        baseUrl,
        fetch: async (input: Request) => {
            const request = input.clone();
            const response = await fetch(request);

            const isAuthEndpoint =
                input.url.includes("/auth/login") ||
                input.url.includes("/auth/register") ||
                input.url.includes("/auth/refresh");

            if (response.status !== 401 || isAuthEndpoint) {
                return response;
            }

            const refreshed = await refreshSession(baseUrl);

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
                const body = await response
                    .clone()
                    .json()
                    .catch(() => ({}));
                throw new Error(body?.message ?? `HTTP ${response.status}`);
            }
        },
    });

    return client;
}
