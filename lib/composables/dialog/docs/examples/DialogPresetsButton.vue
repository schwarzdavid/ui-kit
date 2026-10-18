<template>
    <VBtn v-if="primary" variant="flat" color="primary" @click="openConfirmDialog">{{ label }}</VBtn>
    <VBtn v-else @click="openConfirmDialog">{{ label }}</VBtn>
</template>

<script lang="ts" setup>
    import { VBtn } from 'vuetify/components'
    import { useDialog } from '@/composables/dialog/useDialog'

    defineProps<{
        label: string
        primary?: boolean
    }>()

    const emit = defineEmits<{
        result: [value: boolean]
    }>()

    const dialog = useDialog()

    async function openConfirmDialog(): Promise<void> {
        emit('result', await dialog.confirm('Archive 12 conversations?', 'Archived conversations stay searchable.'))
    }
</script>
