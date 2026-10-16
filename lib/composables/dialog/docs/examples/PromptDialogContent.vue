<template>
    <VCardItem>
        <VTextField v-model="model" :label="label" />
    </VCardItem>
</template>

<script lang="ts" setup>
    import { VCardItem, VTextField } from 'vuetify/components'

    defineProps<{
        label: string
    }>()

    const model = defineModel<string | null>({ required: true })
</script>
