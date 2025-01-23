<template>
    <VCardText>
        <form @submit.prevent>
            <VTextField v-model="v.name.$model" label="Name" :error="v.name.$error"/>
            <VTextField v-model.number="v.age.$model" label="Name" type="number"  :error="v.age.$error"/>
            <VDateInput v-model="v.date.$model" label="Date"  :error="v.date.$error"/>
        </form>
    </VCardText>
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
    } from '@/composables/dialog/presets/FormDialogProps'
    import { ref } from 'vue'
    import useVuelidate, { type ValidationArgs } from '@vuelidate/core'
    import { maxLength, minLength, required } from '@/composables/vuelidate/validators'
    import { VTextField, VCardText } from 'vuetify/components'
    import { VDateInput } from 'vuetify/labs/components'

    defineEmits<FormDialogComponentEmits>()

    defineExpose<FormDialogComponentExposed<string>>({
        finish(): Promise<string> {
            console.log('hi')
            return Promise.resolve('Hi')
        },
    })

    const state = ref<FormDialogForm>({
        age: null,
        date: new Date(),
        name: '',
    })

    const rules: ValidationArgs<FormDialogForm> = {
        name: {
            required,
            minLength: minLength(5),
            maxLength: maxLength(8),
        },
        date: {
            required,
        },
        age: {
            required,
        },
    }

    const v = useVuelidate(rules, state)
</script>
