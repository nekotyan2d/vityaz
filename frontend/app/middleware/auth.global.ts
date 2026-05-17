export default defineNuxtRouteMiddleware(async (to, from) => {
    const withoutAuthRoutes = ["login", "register", "index"];

    const authStore = useAuthStore();

    if (import.meta.server) {
        const headers = useRequestHeaders(["cookie"]);
        const cookie = headers.cookie;
        if (cookie) {
            try {
                const apiBase = "http://localhost:8000";
                let data = await $fetch(`${apiBase}/auth/me`, {
                    method: "GET",
                    headers: {
                        cookie,
                    },
                });

                const user = (data as any)?.employee;
                authStore.setUser(user ?? null);
            } catch (e) {
                authStore.setUser(null);
            }
        }

        await authStore.initPromise;
    } else {
        await authStore.initPromise;
    }

    if (!authStore.isAuthenticated) {
        if (!withoutAuthRoutes.includes(to.name as string)) {
            return navigateTo({ name: "index" });
        }
    } else if (withoutAuthRoutes.includes(to.name as string)) {
        return navigateTo({ name: "home" });
    }
});
