<template>
    <div class="d-flex ga-4">
        <VBtn color="success" @click="showSuccessToast">Success toast</VBtn>
        <VBtn color="primary" @click="showInfoToast">Info toast</VBtn>
        <VBtn color="warning" @click="showWarnToast">Warning toast</VBtn>
        <VBtn color="error" @click="showErrorToast">Error toast</VBtn>
    </div>
</template>

<script lang="ts" setup>
    import { VBtn } from 'vuetify/components'
    import { useToast } from '@/composables/toast/useToast'

    const toast = useToast()

    function showSuccessToast() {
        void toast.success('Success toast')
    }

    function showInfoToast() {
        void toast.info('Info toast')
    }

    function showWarnToast() {
        void toast.warn('Warning toast')
    }

    function showErrorToast() {
        void toast.error('Error toast')
    }
</script>
