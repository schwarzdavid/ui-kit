<template>
    <component :is="entry.component" />
</template>

<script lang="ts" setup>
    import { provide } from 'vue'
    import { DIALOG_ENTRY_INJECTION_KEY } from '@/composables/dialog/constants/injectionKeys'
    import type { DialogQueueEntry } from '@/composables/dialog/types/DialogQueueEntry'

    const props = defineProps<{
        entry: DialogQueueEntry
    }>()

    provide(DIALOG_ENTRY_INJECTION_KEY, {
        id: props.entry.id,
        data: props.entry.data,
        resolve: props.entry.resolve,
        reject: props.entry.reject,
    })
</script>
