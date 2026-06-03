export default defineNuxtRouteMiddleware(async (to, from) => {
    const publicRoutes = ["login", "register", "index", "sse-roomId"];
    const adminRoutes = ["home", "employees", "structure", "journal", "access-matrix"];
    const employeeRoutes = ["log"];

    const authStore = useAuthStore();

    if (import.meta.server) {
        try {
            const api = useApi();
            const { data } = await api.GET("/auth/me");
            authStore.setUser(data?.employee ?? null);
        } catch {
            authStore.setUser(null);
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
