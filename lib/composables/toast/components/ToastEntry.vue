<template>
    <VAlert
        theme="dark"
        class="toast-entry"
        closable
        density="compact"
        @click:close="closeToast">
        <MaybeTranslation :content="entry.message" :translate="entry.translateMessage" />
        <template #prepend>
            <VIcon :icon="icon" :color="color" />
        </template>
    </VAlert>
</template>

<script lang="ts" setup>
    import { computed, onBeforeUnmount, onMounted } from 'vue'
    import { VAlert, VIcon } from 'vuetify/components'
    import MaybeTranslation from '@/components/internal/MaybeTranslation.vue'
    import type { ToastQueueEntry } from '@/composables/toast/types/ToastQueueEntry'
    import { ToastType } from '@/composables/toast/types/ToastType'

    const TYPE_ICON_MAP: Record<ToastType, string> = {
        [ToastType.ERROR]: '$error',
        [ToastType.SUCCESS]: '$success',
        [ToastType.INFO]: '$info',
        [ToastType.WARNING]: '$warning',
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

    const icon = computed(() => TYPE_ICON_MAP[props.entry.type])
    const color = computed(() => TYPE_COLOR_MAP[props.entry.type])

    let timeoutId: ReturnType<typeof setTimeout> | null = null

    function clearTimer(): void {
        if (timeoutId !== null) {
            clearTimeout(timeoutId)
            timeoutId = null
        }
    }

    function closeToast(): void {
        clearTimer()
        props.entry.resolve()
    }

    onMounted(() => {
        timeoutId = setTimeout(closeToast, props.entry.timeout)
    })

    onBeforeUnmount(clearTimer)
</script>

<style lang="scss" scoped>
.toast-entry {
    pointer-events: all;

    &:deep(.v-alert__prepend) {
        align-self: center;
    }
}
</style>
