<template>
    <VBtn variant="flat" color="primary" @click="openTagsDialog">Edit labels</VBtn>
    <p class="mt-4">Labels: {{ labels.join(', ') }}</p>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { VBtn } from 'vuetify/components'
    import { useDialog } from '@/composables/dialog/useDialog'
    import FormDialogTagsContent from '@/composables/dialog/docs/examples/FormDialogTagsContent.vue'

    const dialog = useDialog()
    const labels = ref<string[]>(['customer', 'urgent'])

    async function openTagsDialog(): Promise<void> {
        try {
            labels.value = await dialog.form({
                title: 'Edit labels',
                translateTitle: false,
                component: FormDialogTagsContent,
                props: { suggestions: ['customer', 'urgent', 'invoice', 'newsletter', 'internal'] },
                initialValue: [...labels.value],
                required: true,
            })
        } catch {
            return
        }
    }
</script>
