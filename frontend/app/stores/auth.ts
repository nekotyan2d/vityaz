import { defineStore } from "pinia";
import type { paths } from "@/api/types";

type CurrentUser = paths["/auth/me"]["get"]["responses"]["200"]["content"]["application/json"]["employee"];

export const useAuthStore = defineStore("auth", () => {
    const api = useApi();

    const currentUser = ref<CurrentUser | null>(null);

    const isAuthenticated = ref(false);

    let _initResolve!: () => void;
    const initPromise = new Promise<void>((resolve) => {
        _initResolve = resolve;
    });

    async function loadCurrentUser() {
        try {
            const res = await api.GET("/auth/me", {
                credentials: "include",
            });

            if (!res.data) {
                currentUser.value = null;
                isAuthenticated.value = false;
                return { ok: false };
            }

            currentUser.value = res.data.employee;
            isAuthenticated.value = true;
            return { ok: true, data: res.data };
        } catch (error) {
            currentUser.value = null;
            isAuthenticated.value = false;
            return { ok: false, error };
        }
    }

    async function login(payload: { email: string; password: string }) {
        const res = await api.POST("/auth/login", {
            body: {
                email: payload.email,
                password: payload.password,
            },
        });

        if (!res.error && res.data) {
            await loadCurrentUser();
            return { ok: true, data: res.data };
        }

        return { ok: false };
    }

    function setUser(user: any | null) {
        currentUser.value = user;
        isAuthenticated.value = !!user;
    }

    async function register(payload: { email: string; fullName: string; password: string }) {
        const res = await api.POST("/auth/register", {
            body: {
                email: payload.email,
                full_name: payload.fullName,
                password: payload.password,
            },
        });

        if (!res.error && res.data) {
            await loadCurrentUser();
            return { ok: true, data: res.data };
        }

        return { ok: false };
    }

    async function logout() {
        try {
            await api.POST("/auth/logout", {});
        } finally {
            currentUser.value = null;
            isAuthenticated.value = false;
        }
    }

    async function init() {
        await loadCurrentUser();
        _initResolve();
    }

    if (import.meta.server) {
        // SSR: middleware loads user via setUser(), state hydrates to client
        _initResolve();
    } else if (isAuthenticated.value) {
        // Client: Pinia restored authenticated state from SSR — resolve immediately
        _initResolve();
    } else {
        // Client: no hydrated state — fetch user
        init();
    }

    return {
        currentUser,
        isAuthenticated,
        initPromise,
        login,
        register,
        logout,
        loadCurrentUser,
        setUser,
    };
});
