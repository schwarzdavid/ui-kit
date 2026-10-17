<template>
    <div class="d-flex flex-column ga-5">
        <VTextField v-model="v.name.$model" label="Name" :error="v.name.$error" />
        <VTextField v-model.number="v.age.$model" label="Age" type="number" :error="v.age.$error" />
        <VDateInput v-model="v.date.$model" label="Date" :error="v.date.$error" />
    </div>
</template>

<script lang="ts">
    export interface FormDialogForm {
        name: string
        age: number | null
        date: Date
    }
</script>

<script lang="ts" setup>
    import { ref } from 'vue'
    import useVuelidate, { type ValidationArgs } from '@vuelidate/core'
    import { VDateInput, VTextField } from 'vuetify/components'
    import { maxLength, minLength, required } from '@/composables/vuelidate/validators'
    import { useDialogForm } from '@/composables/dialog/useDialogForm'

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

    useDialogForm(() => state.value.name)
</script>
