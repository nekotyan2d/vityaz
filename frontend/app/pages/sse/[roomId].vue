<template>
    <div
        class="door-screen"
        :data-state="event ? (event.allowed ? 'allowed' : 'denied') : 'idle'">
        <template v-if="!event">
            <p
                v-if="lastRoom"
                class="room-type">
                Помещение
            </p>
            <p class="room-number">{{ lastRoom ?? "—" }}</p>
        </template>

        <template v-else>
            <div class="result__circle">
                <Icon
                    :name="event.allowed ? 'material-symbols:check-rounded' : 'material-symbols:close-rounded'"
                    :size="80" />
            </div>
            <p class="result__status">{{ event.allowed ? "Доступ разрешен" : "Доступ запрещен" }}</p>
            <p class="result__name">{{ event.employeeFullName }}</p>
        </template>
    </div>
</template>

<script lang="ts" setup>
definePageMeta({ layout: false });

const route = useRoute();
const roomId = route.params.roomId as string;

type SsePayload = {
    allowed: boolean;
    employeeFullName: string;
    room: string;
    direction: "in" | "out";
};

const event = ref<SsePayload | null>(null);
const lastRoom = ref<string | null>(null);

let resetTimer: ReturnType<typeof setTimeout> | null = null;

function handleEvent(payload: SsePayload) {
    if (resetTimer) clearTimeout(resetTimer);
    lastRoom.value = payload.room;
    event.value = payload;
    resetTimer = setTimeout(() => {
        event.value = null;
    }, 3000);
}

onMounted(() => {
    const { public: config } = useRuntimeConfig();
    const source = new EventSource(`${config.apiUrl}/sse/${roomId}`);

    source.onmessage = (e) => {
        try {
            handleEvent(JSON.parse(e.data));
        } catch {}
    };

    onUnmounted(() => {
        source.close();
        if (resetTimer) clearTimeout(resetTimer);
    });
});
</script>

<style lang="scss" scoped>
.door-screen {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    background-color: #fff;
    font-family: inherit;
}

.room-type {
    font-size: 2rem;
    color: #666;
    margin: 0;
    font-weight: 400;
}

.room-number {
    font-size: 5rem;
    font-weight: 800;
    margin: 0;
    color: #000;
    letter-spacing: -0.02em;
}

.result__circle {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;

    .door-screen[data-state="allowed"] & {
        background-color: #4caf50;
    }

    .door-screen[data-state="denied"] & {
        background-color: #ef5350;
    }
}

.result__status {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 8px 0 0;
    color: #000;
}

.result__name {
    font-size: 1.75rem;
    font-weight: 400;
    margin: 0;
    color: #333;
}
</style>
