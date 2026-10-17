<template>
    <VBottomSheet :model-value="open" inset @update:model-value="() => close(false)" @after-leave="settle">
        <VSheet class="custom-confirm pa-6 text-center">
            <h2 class="text-title-large mb-2">{{ data.title }}</h2>
            <p v-if="'content' in data" class="mb-6">{{ data.content }}</p>
            <div class="d-flex justify-center ga-2">
                <VBtn variant="text" @click="() => close(false)">No</VBtn>
                <VBtn variant="flat" color="primary" @click="() => close(true)">Yes</VBtn>
            </div>
        </VSheet>
    </VBottomSheet>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { VBottomSheet, VBtn, VSheet } from 'vuetify/components'
    import { useDialogEntry } from '@/composables/dialog/useDialogEntry'
    import type { ConfirmDialogProps } from '@/composables/dialog/presets/ConfirmDialogProps'

    const { data, resolve } = useDialogEntry<ConfirmDialogProps, boolean>()
    const open = ref(true)

    let confirmed = false

    function close(value: boolean): void {
        confirmed = value
        open.value = false
    }

    function settle(): void {
        resolve(confirmed)
    }
</script>
