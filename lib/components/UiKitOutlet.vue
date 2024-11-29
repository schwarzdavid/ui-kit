<template>
    <DialogOutlet/>
    <ToastOutlet/>
    <LoadingOverlay/>
</template>

<script setup lang="ts">
    import DialogOutlet from '@/composables/dialog/components/dialog/DialogOutlet.vue'
    import ToastOutlet from '@/composables/toast/components/ToastOutlet.vue'
    import LoadingOverlay from '@/composables/loading-overlay/components/LoadingOverlay.vue'
</script>
