<template>
    <div class="employees-list">
        <EmployeesItem
            v-for="employee in employees"
            :key="employee.id"
            :employee="employee"
            @ban="$emit('ban', $event)"
            @edit="$emit('edit', $event)" />
    </div>
</template>
<script lang="ts" setup>
import type { paths } from "@/api/types";

type Employee = paths["/employees"]["get"]["responses"]["200"]["content"]["application/json"]["employees"][number];

defineProps<{
    employees: Employee[];
}>();

defineEmits<{
    (e: "ban", employee: Employee): void;
    (e: "edit", employee: Employee): void;
}>();
</script>
<style lang="scss" scoped>
.employees-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
</style>
