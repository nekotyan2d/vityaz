export default defineNuxtRouteMiddleware(async (to) => {
    const guestRoutes = ["login", "register", "index"];
    const openRoutes = ["sse-roomId"];
    const adminRoutes = ["home", "employees", "structure", "journal", "access-matrix"];
    const employeeRoutes = ["log"];

    const routeName = to.name as string;

    if (openRoutes.includes(routeName)) return;

    const authStore = useAuthStore();

    if (import.meta.server) {
        const { internalApiUrl, public: { apiUrl: publicApiUrl } } = useRuntimeConfig();
        const apiUrl = internalApiUrl || publicApiUrl;
        const headers = useRequestHeaders(["cookie"]);
        try {
            const data = await $fetch<{ employee: any }>(`${apiUrl}/auth/me`, {
                headers: headers.cookie ? { cookie: headers.cookie } : {},
            });
            authStore.setUser(data?.employee ?? null);
        } catch {
            authStore.setUser(null);
        }
    }

    await authStore.initPromise;

    const role = authStore.currentUser?.role;

    if (!authStore.isAuthenticated) {
        if (!guestRoutes.includes(routeName)) {
            return navigateTo({ name: "index" });
        }
        return;
    }

    if (guestRoutes.includes(routeName)) {
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
