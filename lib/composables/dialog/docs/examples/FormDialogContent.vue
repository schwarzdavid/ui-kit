<template>
    <h1>Hi</h1>
</template>

<script lang="ts" setup>
    import type {
        FormDialogComponentExposed,
        FormDialogComponentProps,
    } from '@/composables/dialog/presets/FormDialogProps'

    defineProps<FormDialogComponentProps>()

    defineExpose<FormDialogComponentExposed<string>>({
        finish(): Promise<string> {
            console.log('hi')
            return Promise.resolve('Hi')
        },
    })
</script>
