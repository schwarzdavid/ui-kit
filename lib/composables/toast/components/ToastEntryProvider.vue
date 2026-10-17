<template>
    <component :is="toastComponent" />
</template>

<script lang="ts" setup>
    import { computed, provide } from 'vue'
    import { TOAST_ENTRY_INJECTION_KEY } from '@/composables/toast/constants/injectionKey'
    import { useToastQueue } from '@/composables/toast/internal/useToastQueue'
    import type { ToastQueueEntry } from '@/composables/toast/types/ToastQueueEntry'
    import { usePluginContext } from '@/plugin/composables/usePluginContext'

    const props = defineProps<{
        entry: ToastQueueEntry
    }>()

    const { options } = usePluginContext()
    const { close, trigger } = useToastQueue()
    const toastComponent = computed(() => options.components.toast)

    provide(TOAST_ENTRY_INJECTION_KEY, {
        entry: props.entry,
        close: () => {
            close(props.entry.id)
        },
        trigger: () => {
            trigger(props.entry.id)
        },
    })
</script>
