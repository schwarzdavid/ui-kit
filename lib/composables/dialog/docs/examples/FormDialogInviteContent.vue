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
    import { ref } from 'vue'
    import useVuelidate from '@vuelidate/core'
    import { VTextField } from 'vuetify/components'
    import { email, required } from '@/composables/vuelidate/validators'
    import { useDialogForm } from '@/composables/dialog/useDialogForm'

    const state = ref({ email: '' })
    const v = useVuelidate({ email: { required, email } }, state)
    const { loading } = useDialogForm(() => state.value.email.trim())
</script>
