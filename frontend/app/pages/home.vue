<template>{{ authStore.currentUser }}</template>
<script lang="ts" setup>
const authStore = useAuthStore();
</script>
