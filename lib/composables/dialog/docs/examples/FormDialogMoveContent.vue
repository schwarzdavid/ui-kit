<template>
    <p class="text-body-medium mb-3">Double-click a folder to move the file right away.</p>
    <VList
        v-model:selected="selected"
        density="compact"
        mandatory
        :items="folders"
        item-title="name"
        item-value="id"
        @dblclick="submit" />
    <p v-if="v.model.$error" class="text-error text-body-small mt-2">Choose a folder.</p>
</template>

<script lang="ts">
    export interface Folder {
        id: string
        name: string
    }
</script>

<script lang="ts" setup>
    import { computed } from 'vue'
    import useVuelidate from '@vuelidate/core'
    import { VList } from 'vuetify/components'
    import { required } from '@/composables/vuelidate/validators'
    import { useDialogForm } from '@/composables/dialog/useDialogForm'

    defineProps<{
        folders: Folder[]
    }>()

    const model = defineModel<string | null>({ required: true })
    const selected = computed({
        get: () => model.value === null ? [] : [model.value],
        set: (value: string[]) => {
            model.value = value[0] ?? null
        },
    })
    const v = useVuelidate({ model: { required } }, { model })
    const { submit } = useDialogForm(() => model.value)
</script>
