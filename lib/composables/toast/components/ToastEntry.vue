<template>
    <VAlert theme="dark" class="toast-entry">{{entry.message}}</VAlert>
</template>

<script lang="ts" setup>
    import type { ToastQueueEntry } from '@/composables/toast/types/TaostQueueEntry'
    import { onMounted, ref } from 'vue'
    import { useToastQueue } from '@/composables/toast/internal/useToastQueue'
    import { VAlert } from 'vuetify/components'

    const props = defineProps<{
        entry: ToastQueueEntry
    }>()

    const toastQueue = useToastQueue()
    const timeoutId = ref<number | null>(null)

    onMounted(() => {
        timeoutId.value = window.setTimeout(() => {
            toastQueue.removeFromQueue(props.entry.id)
        }, props.entry.timeout)
    })
</script>

<style lang="scss" scoped>
.toast-entry {
    pointer-events: all;
}
</style>
