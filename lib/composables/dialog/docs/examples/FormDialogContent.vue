<template>
    <h1>Hi</h1>
</template>

<script lang="ts" setup>
    import type {
        InternalFormDialogComponentEmits,
        FormDialogComponentExposed,
        FormDialogComponentProps,
    } from '@/composables/dialog/presets/FormDialogProps'

    defineProps<FormDialogComponentProps>()

    defineEmits<InternalFormDialogComponentEmits>()

    defineExpose<FormDialogComponentExposed<string>>({
        finish(): Promise<string> {
            console.log('hi')
            return Promise.resolve('Hi')
        },
    })

    const model = defineModel('loading')

    function log() {
        console.log(model.value)
    }
</script>
