<template>
    <DialogEntryProvider v-for="entry in queue" :key="entry.id" :entry="entry" />
</template>

<script lang="ts" setup>
    import { useDialogQueue } from '@/composables/dialog/internal/useDialogQueue'
    import DialogEntryProvider from '@/composables/dialog/components/dialog/DialogEntryProvider.vue'

    const { queue } = useDialogQueue()
</script>
