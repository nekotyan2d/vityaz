<template>
    <div class="qr-page">
        <header class="qr-header">
            <h1>Сканер QR</h1>
        </header>

        <div class="qr-content">
            <template v-if="phase === 'scanning'">
                <p class="hint">Наведите камеру на QR-код помещения</p>
                <ClientOnly>
                    <QrcodeStream
                        class="camera"
                        @detect="onDetect"
                        @error="onCameraError" />
                    <template #fallback>
                        <div class="camera-placeholder">Загрузка камеры...</div>
                    </template>
                </ClientOnly>
                <p
                    v-if="cameraError"
                    class="error-text">
                    {{ cameraError }}
                </p>
            </template>

            <template v-else-if="phase === 'direction'">
                <p class="hint">Выберите направление</p>
                <div class="direction-buttons">
                    <button
                        class="direction-btn direction-btn--in"
                        @click="checkAccess('in')">
                        <Icon
                            name="material-symbols:login-rounded"
                            :size="32" />
                        Вход
                    </button>
                    <button
                        class="direction-btn direction-btn--out"
                        @click="checkAccess('out')">
                        <Icon
                            name="material-symbols:logout-rounded"
                            :size="32" />
                        Выход
                    </button>
                </div>
                <button
                    class="cancel-link"
                    @click="reset">
                    Отмена
                </button>
            </template>

            <template v-else-if="phase === 'result'">
                <div
                    class="result"
                    :data-status="result?.status">
                    <div class="result__circle">
                        <Icon
                            :name="resultIcon"
                            :size="48" />
                    </div>
                    <p class="result__text">{{ resultText }}</p>
                    <p
                        v-if="result?.deny_reason"
                        class="result__reason">
                        {{ result.deny_reason }}
                    </p>
                </div>
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { QrcodeStream } from "vue-qrcode-reader";

definePageMeta({ layout: "employee" });

const api = useApi();

type Phase = "scanning" | "direction" | "result";
type Result = { status: "allowed" | "denied" | "violation"; deny_reason: string | null };

const phase = ref<Phase>("scanning");
const qrToken = ref<string>("");
const result = ref<Result | null>(null);
const cameraError = ref<string>("");

function onDetect(detectedCodes: { rawValue: string }[]) {
    const token = detectedCodes[0]?.rawValue;
    if (!token) return;
    qrToken.value = token;
    phase.value = "direction";
}

function onCameraError(error: Error) {
    cameraError.value = "Нет доступа к камере: " + error.message;
}

async function checkAccess(direction: "in" | "out") {
    try {
        const res = await api.POST("/access/check", {
            body: { qr_token: qrToken.value, direction },
        });
        if (res.data) {
            result.value = res.data;
            phase.value = "result";
        }
    } catch (e) {
        result.value = { status: "denied", deny_reason: e instanceof Error ? e.message : "Ошибка проверки" };
        phase.value = "result";
    }
}

function reset() {
    phase.value = "scanning";
    qrToken.value = "";
    result.value = null;
    cameraError.value = "";
}

const resultIcon = computed(() => {
    if (result.value?.status === "allowed") return "material-symbols:check-rounded";
    if (result.value?.status === "violation") return "material-symbols:warning-rounded";
    return "material-symbols:close-rounded";
});

const resultText = computed(() => {
    if (result.value?.status === "allowed") return "Доступ разрешён";
    if (result.value?.status === "violation") return "Нарушение";
    return "Доступ запрещён";
});
</script>

<style lang="scss" scoped>
.qr-page {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.qr-header {
    padding: 20px 16px 12px;

    h1 {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
        color: var(--color-text);
    }
}

.qr-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    gap: 24px;
}

.hint {
    font-size: 1rem;
    color: var(--color-text-secondary);
    text-align: center;
    margin: 0;
}

.camera {
    width: 100%;
    max-width: 360px;
    aspect-ratio: 1;
    border-radius: 16px;
    overflow: hidden;
}

.camera-placeholder {
    width: 100%;
    max-width: 360px;
    aspect-ratio: 1;
    border-radius: 16px;
    background-color: var(--color-background-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
}

.error-text {
    color: #c62828;
    font-size: 0.875rem;
    text-align: center;
    margin: 0;
}

.direction-buttons {
    display: flex;
    gap: 16px;
    width: 100%;
    max-width: 360px;
}

.direction-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px 16px;
    border: none;
    border-radius: 16px;
    font-size: 1rem;
    font-family: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
    color: #fff;

    &:hover {
        opacity: 0.85;
    }

    &--in {
        background-color: var(--color-primary);
    }

    &--out {
        background-color: #455a64;
    }
}

.cancel-link {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    cursor: pointer;
    padding: 4px 8px;
    font-family: inherit;

    &:hover {
        color: var(--color-text);
    }
}

.result {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;

    &__circle {
        width: 96px;
        height: 96px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;

        .result[data-status="allowed"] & {
            background-color: #4caf50;
        }

        .result[data-status="denied"] & {
            background-color: #ef5350;
        }

        .result[data-status="violation"] & {
            background-color: #ff9800;
        }
    }

    &__text {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
        color: var(--color-text);
    }

    &__reason {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        margin: 0;
    }
}
</style>
