<template>
    <div class="d-flex flex-wrap ga-4">
        <VBtn variant="flat" color="primary" @click="openRenameDialog">Rename</VBtn>
        <VBtn @click="openFormDialog">New profile</VBtn>
        <VBtn @click="openTemplateDialog">Choose a template</VBtn>
    </div>
    <div v-if="result !== null" class="mt-4">
        <p>Last result: {{ result }}</p>
        <VBtn variant="text" class="mt-2" @click="reset">Reset</VBtn>
    </div>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { VBtn } from 'vuetify/components'
    import { useDialog } from '@/composables/dialog/useDialog'
    import FormDialogContent from '@/composables/dialog/docs/examples/FormDialogContent.vue'
    import FormDialogFieldContent from '@/composables/dialog/docs/examples/FormDialogFieldContent.vue'
    import FormDialogLargeContent from '@/composables/dialog/docs/examples/FormDialogLargeContent.vue'

    const dialog = useDialog()
    const result = ref<unknown>(null)

    function reset(): void {
        result.value = null
    }

    async function openRenameDialog(): Promise<void> {
        try {
            result.value = await dialog.form({
                title: 'Rename inbound form',
                translateTitle: false,
                component: FormDialogFieldContent,
                props: {
                    label: 'Name',
                },
                initialValue: 'Contact request',
                required: true,
            })
        } catch {
            return
        }
    }

    async function openFormDialog(): Promise<void> {
        result.value = await dialog.form<string>({
            title: 'New profile',
            translateTitle: false,
            component: FormDialogContent,
        })
    }

    async function openTemplateDialog(): Promise<void> {
        result.value = await dialog.form<number>({
            title: 'Choose a template',
            translateTitle: false,
            component: FormDialogLargeContent,
            width: 'lg',
        })
    }
</script>
