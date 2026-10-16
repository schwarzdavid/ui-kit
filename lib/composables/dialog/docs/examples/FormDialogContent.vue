<template>
    <VCardText>
        <form @submit.prevent="emit('save')">
            <VTextField v-model="v.name.$model" label="Name" :error="v.name.$error" />
            <VTextField v-model.number="v.age.$model" label="Age" type="number" :error="v.age.$error" />
            <VDateInput v-model="v.date.$model" label="Date" :error="v.date.$error" />
            <button type="submit" class="d-none" />
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
    import { VCardText, VDateInput, VTextField } from 'vuetify/components'

    const emit = defineEmits<FormDialogComponentEmits>()

    defineExpose<FormDialogComponentExposed<string>>({
        finish(): Promise<string> {
            return Promise.resolve(state.value.name)
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
