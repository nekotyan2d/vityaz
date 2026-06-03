export default defineNuxtRouteMiddleware(async (to, from) => {
    const publicRoutes = ["login", "register", "index"];
    const adminRoutes = ["home", "employees", "structure", "journal", "access-matrix"];
    const employeeRoutes = ["log"];

    const authStore = useAuthStore();

    if (import.meta.server) {
        const api = useApi();
        try {
            const res = await api.GET("/auth/me");
            authStore.setUser(res.data?.employee ?? null);
        } catch {
            // SSR auth failed (backend unreachable) — don't redirect,
            // let client re-validate with browser cookies
            return;
        }
    }

    await authStore.initPromise;

    const routeName = to.name as string;
    const role = authStore.currentUser?.role;

    if (!authStore.isAuthenticated) {
        if (!publicRoutes.includes(routeName)) {
            if (import.meta.server) return; // не редиректим с сервера при провале
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
