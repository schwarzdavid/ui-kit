<template>
    <div class="d-flex gc-4">
        <VBtn color="primary" @click="openFormDialog">Dings</VBtn>
    </div>
</template>

<script lang="ts" setup>
    import { VBtn } from 'vuetify/components'
    import { useDialog } from '@/composables/dialog/useDialog'
    import FormDialogContent from '@/composables/dialog/docs/examples/FormDialogContent.vue'

    const dialog = useDialog()

    async function openFormDialog() {
        await dialog.form({
            title: 'Dingsbums',
            component: FormDialogContent,
        })
    }
</script>
