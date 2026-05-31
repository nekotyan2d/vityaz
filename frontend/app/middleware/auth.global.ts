export default defineNuxtRouteMiddleware(async (to, from) => {
    const publicRoutes = ["login", "register", "index"];
    const adminRoutes = ["home", "employees", "structure", "journal", "access-matrix"];
    const employeeRoutes = ["qr", "log"];

    const authStore = useAuthStore();
    const { public: config } = useRuntimeConfig();

    if (import.meta.server) {
        const headers = useRequestHeaders(["cookie"]);
        const cookie = headers.cookie;
        if (cookie) {
            try {
                const data = await $fetch(`${config.apiUrl}/auth/me`, {
                    method: "GET",
                    headers: { cookie },
                });

                const user = (data as any)?.employee;
                authStore.setUser(user ?? null);
            } catch (e) {
                authStore.setUser(null);
            }
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
