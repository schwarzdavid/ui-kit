<template>
    <VAlert theme="dark" class="toast-entry" closable @click:close="closeToast" density="compact">
        <span>{{entry.message}}</span>
        <template #prepend v-if="icon">
            <VIcon :icon="icon" :color="color"/>
        </template>
    </VAlert>
</template>

<script lang="ts" setup>
    import type { ToastQueueEntry } from '@/composables/toast/types/TaostQueueEntry'
    import { computed, onMounted, ref } from 'vue'
    import { useToastQueue } from '@/composables/toast/internal/useToastQueue'
    import { VAlert, VIcon } from 'vuetify/components'
    import { ToastType } from '@/composables/toast/types/ToastType'

    const TYPE_ICON_MAP: Record<ToastType, string> = {
        [ToastType.ERROR]: 'mdi-alert-circle-outline',
        [ToastType.SUCCESS]: 'mdi-check-circle-outline',
        [ToastType.INFO]: 'mdi-information-outline',
        [ToastType.WARNING]: 'mdi-alert-circle-outline',
    }

    const TYPE_COLOR_MAP: Record<ToastType, string> = {
        [ToastType.ERROR]: 'error',
        [ToastType.SUCCESS]: 'success',
        [ToastType.INFO]: 'primary',
        [ToastType.WARNING]: 'warning',
    }

    const props = defineProps<{
        entry: ToastQueueEntry
    }>()

    const toastQueue = useToastQueue()
    const timeoutId = ref<number>(-1)
    const icon = computed(() => TYPE_ICON_MAP[props.entry.type])
    const color = computed(() => TYPE_COLOR_MAP[props.entry.type])

    function closeToast() {
        window.clearTimeout(timeoutId.value)
        toastQueue.removeFromQueue(props.entry.id)
    }

    onMounted(() => {
        timeoutId.value = window.setTimeout(() => {
            // closeToast()
        }, props.entry.timeout)
    })
</script>

<style lang="scss" scoped>
.toast-entry {
    pointer-events: all;

    &:deep(.v-alert__prepend) {
        align-self: center;
    }
}
</style>
