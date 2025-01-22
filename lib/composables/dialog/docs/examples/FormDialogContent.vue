<template>
    <form @submit.prevent>

    </form>
</template>

<script lang="ts">
    export interface FormDialogForm {
        name: string
        age: number | null
        date: Date
    }
</script>

<script lang="ts" setup>
    import type {
        FormDialogComponentEmits,
        FormDialogComponentExposed,
        FormDialogComponentProps,
    } from '@/composables/dialog/presets/FormDialogProps'
    import { ref } from 'vue'
    import type { ValidationArgs } from '@vuelidate/core'

    defineProps<FormDialogComponentProps>()

    defineEmits<FormDialogComponentEmits>()

    defineExpose<FormDialogComponentExposed<string>>({
        finish(): Promise<string> {
            console.log('hi')
            return Promise.resolve('Hi')
        },
    })

    const model = defineModel('loading')

    const state = ref<FormDialogForm>({
        age: null,
        date: new Date(),
        name: '',
    })

    const rules: ValidationArgs<FormDialogForm> = {
        age: {
            required,
        },
    }
</script>
