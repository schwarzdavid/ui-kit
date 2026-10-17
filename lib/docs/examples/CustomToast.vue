<template>
    <VSheet
        class="custom-toast d-flex align-center ga-2 px-4 py-2"
        color="primary"
        rounded="pill"
        :role="entry.type === ToastType.ERROR ? 'alert' : undefined">
        <span class="flex-grow-1">{{ entry.message }}</span>
        <VBtn v-if="entry.action" variant="text" size="small" @click="trigger">{{ entry.action.text }}</VBtn>
        <VBtn variant="text" size="small" :icon="`svg:${mdiClose}`" aria-label="Dismiss" @click="close" />
    </VSheet>
</template>

<script lang="ts" setup>
    import { VBtn, VSheet } from 'vuetify/components'
    import { mdiClose } from '@mdi/js'
    import { useToastEntry } from '@/composables/toast/useToastEntry'
    import { ToastType } from '@/composables/toast/types/ToastType'

    const { entry, close, trigger } = useToastEntry()
</script>

<style scoped>
.custom-toast {
    pointer-events: auto;
}
</style>
