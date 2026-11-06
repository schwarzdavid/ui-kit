<template>
    <div class="d-flex flex-column ga-5">
        <VTextField
            v-model="v.name.$model"
            label="Name"
            :error="v.name.$error || taken"
            :error-messages="taken ? 'This name is already taken.' : undefined"
            hint="Try “admin” to see onDialogFinish cancel the save."
            persistent-hint />
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
    import { onDialogFinish } from '@/composables/dialog/onDialogFinish'

    const model = defineModel<FormDialogForm>({ required: true })

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

    const v = useVuelidate(rules, model)
    const taken = ref(false)

    onDialogFinish(async () => {
        await new Promise(resolve => setTimeout(resolve, 400))
        taken.value = model.value.name.trim().toLowerCase() === 'admin'
        return !taken.value
    })
</script>
