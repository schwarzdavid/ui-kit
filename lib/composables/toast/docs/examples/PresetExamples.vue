<template>
    <div class="d-flex flex-wrap ga-4">
        <VBtn variant="flat" color="primary" @click="showSuccessToast">Success</VBtn>
        <VBtn @click="showInfoToast">Info</VBtn>
        <VBtn @click="showWarnToast">Warning</VBtn>
        <VBtn @click="showErrorToast">Error with retry</VBtn>
        <VBtn @click="showUndoToast">Undo pattern</VBtn>
    </div>
    <p v-if="undoResult" class="mt-4">{{ undoResult }}</p>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { VBtn } from 'vuetify/components'
    import { useToast } from '@/composables/toast/useToast'

    const toast = useToast()
    const undoResult = ref('')

    function showSuccessToast(): void {
        void toast.success('Project saved', { translateMessage: false })
    }

    function showInfoToast(): void {
        void toast.info('Template published as v4', { translateMessage: false })
    }

    function showWarnToast(): void {
        void toast.warn('Two DNS records are still invalid', { translateMessage: false })
    }

    function showErrorToast(): void {
        void toast.error('Couldn\'t deactivate the form', {
            translateMessage: false,
            action: { text: 'Retry', translateText: false, handler: showSuccessToast },
        })
    }

    async function showUndoToast(): Promise<void> {
        undoResult.value = 'Field "budget" removed, waiting for the toast'
        const undone = await toast.success('Field "budget" removed', {
            translateMessage: false,
            timeout: 8000,
            action: { text: 'Undo', translateText: false },
        })
        undoResult.value = undone ? 'Removal undone' : 'Removal committed'
    }
</script>
