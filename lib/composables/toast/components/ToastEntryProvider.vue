<template>
    <component
        :is="toastComponent"
        @mouseenter="pause(entry.id, 'hover')"
        @mouseleave="resume(entry.id, 'hover')"
        @focusin="pause(entry.id, 'focus')"
        @focusout="onFocusOut" />
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
    const { close, trigger, pause, resume } = useToastQueue()
    const toastComponent = computed(() => options.components.toast)

    function onFocusOut(event: FocusEvent): void {
        const root = event.currentTarget
        if (root instanceof Node && event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) {
            return
        }
        resume(props.entry.id, 'focus')
    }

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
