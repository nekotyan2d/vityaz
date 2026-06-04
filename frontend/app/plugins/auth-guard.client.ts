export default defineNuxtPlugin(() => {
    const authStore = useAuthStore();
    const router = useRouter();

    watch(
        () => authStore.isAuthenticated,
        (isAuth, wasAuth) => {
            if (wasAuth && !isAuth) {
                router.push({ name: "index" });
            }
        },
    );
});
