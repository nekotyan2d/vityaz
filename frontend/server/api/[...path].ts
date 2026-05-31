import { proxyRequest } from "h3";

export default defineEventHandler((event) => {
    const config = useRuntimeConfig();
    const path = event.path.replace(/^\/api/, "");
    return proxyRequest(event, `${config.public.apiUrl}${path}`);
});
