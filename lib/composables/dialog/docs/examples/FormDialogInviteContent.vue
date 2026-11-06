<template>
    <VTextField
        v-model="v.email.$model"
        label="Email address"
        type="email"
        :error="v.email.$error"
        :disabled="loading"
        hint="Use an address containing “taken” to see a failing save."
        persistent-hint />
</template>

<script lang="ts" setup>
    import useVuelidate from '@vuelidate/core'
    import { VTextField } from 'vuetify/components'
    import { email, required } from '@/composables/vuelidate/validators'
    import { useFormDialog } from '@/composables/dialog/useFormDialog'

    const model = defineModel<string>({ required: true })
    const v = useVuelidate({ email: { required, email } }, { email: model })
    const { loading } = useFormDialog()
</script>
