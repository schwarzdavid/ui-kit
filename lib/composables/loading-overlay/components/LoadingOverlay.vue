<template>
    <VOverlay v-model="isOverlayActive" persistent class="d-flex align-center justify-center">
        <VProgressCircular indeterminate color="primary" size="100"/>
    </VOverlay>
</template>

<script lang="ts" setup>
    import { useLoadingOverlay } from '@/composables/loading-overlay/useLoadingOverlay'
    import { VOverlay, VProgressCircular } from 'vuetify/components'

    const isOverlayActive = useLoadingOverlay()
</script>
