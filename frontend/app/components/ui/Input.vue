<template>
    <div
        class="input"
        :data-has-error="!!model?.error">
        <input
            v-model="model!.value"
            v-bind="$attrs" />
        <div
            v-if="model?.error"
            class="error-text">
            {{ model.error }}
        </div>
    </div>
</template>
<script lang="ts" setup>
import z from "zod";

const model = defineModel<{
    value: string;
    error?: string;
}>();

const props = defineProps<{
    schema: z.ZodType;
}>();
watch(
    () => model.value!.value,
    (value) => {
        const result = props.schema.safeParse(value);
        if (!result.success) {
            model.value!.error = z.treeifyError(result.error).errors[0];
        } else {
            model.value!.error = undefined;
        }
    },
);
</script>
<style lang="scss" scoped>
.input {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    &[data-has-error="true"] {
        input {
            border-color: var(--color-input-border-danger);
            background-color: var(--color-input-background-danger);
            &::placeholder {
                color: var(--color-input-placeholder-danger);
            }
        }
    }

    input {
        display: block;
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--color-input-border);
        background-color: var(--color-input-background);
        border-radius: 12px;
        height: 40px;
        font-size: 16px;
        outline: none;
        font-family: inherit;

        &::placeholder {
            color: var(--color-input-placeholder);
        }
    }

    .error-text {
        color: var(--color-input-border-danger);
        font-size: 0.875rem;
    }
}
</style>
