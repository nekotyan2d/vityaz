export default defineNuxtRouteMiddleware(async (to, from) => {
    const publicRoutes = ["login", "register", "index"];
    const adminRoutes = ["home", "employees", "structure", "journal", "access-matrix"];
    const employeeRoutes = ["log"];

    const authStore = useAuthStore();

    if (import.meta.server) {
        const { apiUrl: privateApiUrl, public: { apiUrl: publicApiUrl } } = useRuntimeConfig();
        const apiUrl = privateApiUrl || publicApiUrl;
        const headers = useRequestHeaders(["cookie"]);
        try {
            const data = await $fetch<{ employee: any }>(`${apiUrl}/auth/me`, {
                headers: headers.cookie ? { cookie: headers.cookie } : {},
            });
            authStore.setUser(data?.employee ?? null);
        } catch (e: any) {
            authStore.setUser(null);
            // Если бекенд недоступен (не 401), не редиректим — клиент разберётся
            if (e?.statusCode !== 401 && e?.status !== 401) return;
        }
    }

    await authStore.initPromise;

    const routeName = to.name as string;
    const role = authStore.currentUser?.role;

    if (!authStore.isAuthenticated) {
        if (!publicRoutes.includes(routeName)) {
            return navigateTo({ name: "index" });
        }
        return;
    }

    if (publicRoutes.includes(routeName)) {
        if (role === "employee") return navigateTo({ name: "qr" });
        return navigateTo({ name: "home" });
    }

if (role === "employee" && adminRoutes.includes(routeName)) {
        return navigateTo({ name: "qr" });
    }

    if ((role === "admin" || role === "security") && employeeRoutes.includes(routeName)) {
        return navigateTo({ name: "home" });
    }
});
