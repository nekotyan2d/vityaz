function decodeAccessToken(cookie: string): { employeeId: number; role: "admin" | "security" | "employee" } | null {
    try {
        const match = cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
        const token = match?.[1];
        if (!token) return null;

        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const base64 = (parts[1] ?? "").replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
        const payload = JSON.parse(atob(padded));

        if (!payload.exp || !payload.employeeId || !payload.role) return null;
        if (payload.exp * 1000 <= Date.now()) return null;

        return { employeeId: payload.employeeId, role: payload.role };
    } catch {
        return null;
    }
}

export default defineNuxtRouteMiddleware(async (to, from) => {
    const publicRoutes = ["login", "register", "index", "sse-roomId"];
    const adminRoutes = ["home", "employees", "structure", "journal", "access-matrix"];
    const employeeRoutes = ["log"];

    const authStore = useAuthStore();

    if (import.meta.server) {
        const { cookie } = useRequestHeaders(["cookie"]);
        if (cookie) {
            const payload = decodeAccessToken(cookie);
            if (payload) {
                authStore.setUser({ id: payload.employeeId, role: payload.role });
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
