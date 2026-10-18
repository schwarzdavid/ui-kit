<template>
    <VCombobox
        v-model="model"
        :items="suggestions"
        label="Labels"
        multiple
        chips
        closable-chips
        hint="Save stays disabled until at least one label is set."
        persistent-hint />
</template>

<script lang="ts" setup>
    import { VCombobox } from 'vuetify/components'

    defineProps<{
        suggestions: string[]
    }>()

    const model = defineModel<string[] | null>({ required: true })
</script>
