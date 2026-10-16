<template>
    <div class="d-flex gc-4">
        <VBtn color="primary" @click="openFormDialog">Open form dialog</VBtn>
    </div>
    <p v-if="result !== null" class="mt-4">Saved name: {{ result }}</p>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { VBtn } from 'vuetify/components'
    import { useDialog } from '@/composables/dialog/useDialog'
    import FormDialogContent from '@/composables/dialog/docs/examples/FormDialogContent.vue'

    const dialog = useDialog()
    const result = ref<string | null>(null)

    async function openFormDialog(): Promise<void> {
        result.value = await dialog.form<string>({
            title: 'Create profile',
            translateTitle: false,
            component: FormDialogContent,
        })
    }
</script>
