<template>
    <VTextField v-model="model" :label="label" />
</template>

<script lang="ts" setup>
    import { VTextField } from 'vuetify/components'

    defineProps<{
        label: string
    }>()

    const model = defineModel<string | null>({ required: true })
</script>
