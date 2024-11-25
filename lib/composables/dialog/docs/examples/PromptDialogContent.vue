<template>
    <VCardItem>
        <input v-model="model" type="text">
    </vcarditem>
</template>

<script lang="ts" setup>
    import { VCardItem } from 'vuetify/components'

    defineProps<{
        label: string
    }>()

    const model = defineModel<Record<string, string>>({ required: true })
</script>
