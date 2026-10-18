<template>
    <VBtn variant="flat" color="primary" @click="openMoveDialog">Move invoice.pdf</VBtn>
    <p v-if="folder !== null" class="mt-4">Moved to folder: {{ folder }}</p>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { VBtn } from 'vuetify/components'
    import { useDialog } from '@/composables/dialog/useDialog'
    import FormDialogMoveContent from '@/composables/dialog/docs/examples/FormDialogMoveContent.vue'

    const dialog = useDialog()
    const folder = ref<string | null>(null)

    async function openMoveDialog(): Promise<void> {
        folder.value = await dialog.form({
            title: 'Move invoice.pdf',
            translateTitle: false,
            width: 'sm',
            component: FormDialogMoveContent,
            props: {
                folders: [
                    { id: 'inbox', name: 'Inbox' },
                    { id: 'invoices', name: 'Invoices' },
                    { id: 'archive', name: 'Archive' },
                    { id: 'tax-2026', name: 'Tax 2026' },
                ],
            },
            initialValue: folder.value ?? 'inbox',
            saveCta: { text: 'Move', translateText: false },
            abortCta: { text: 'Cancel', translateText: false },
        })
    }
</script>
