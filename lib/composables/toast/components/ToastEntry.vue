<template>
    <VAlert theme="dark" class="toast-entry" closable @click:close="closeToast">{{entry.message}}</VAlert>
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
    const timeoutId = ref<number>(-1)

    function closeToast() {
        window.clearTimeout(timeoutId.value)
        toastQueue.removeFromQueue(props.entry.id)
    }

    onMounted(() => {
        timeoutId.value = window.setTimeout(() => {
            closeToast()
        }, props.entry.timeout)
    })
</script>

<style lang="scss" scoped>
.toast-entry {
    pointer-events: all;
}
</style>
