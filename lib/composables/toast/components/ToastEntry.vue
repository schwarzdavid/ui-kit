<template>
    <VSnackbar :timeout="entry.timeout" v-model="snackbarModel" location-strategy="connected" target="parent" attach timer location="bottom center">{{entry.message}}</VSnackbar>
</template>

<script lang="ts" setup>
    import type { ToastQueueEntry } from '@/composables/toast/types/TaostQueueEntry'
    import { ref, watch } from 'vue'
    import { useToastQueue } from '@/composables/toast/internal/useToastQueue'
    import { VSnackbar } from 'vuetify/components'

    const props = defineProps<{
        entry: ToastQueueEntry
    }>()

    const snackbarModel = ref(true)
    const toastQueue = useToastQueue()

    watch(snackbarModel, () => {
        setTimeout(() => {
            toastQueue.removeFromQueue(props.entry.id)
        }, 1000)
    })
</script>
