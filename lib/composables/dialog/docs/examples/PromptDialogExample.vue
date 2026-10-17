<template>
    <div class="d-flex flex-wrap ga-4">
        <VBtn variant="flat" color="primary" @click="openPromptDialog">Rename</VBtn>
        <VBtn @click="openLargePromptDialog">Large prompt</VBtn>
    </div>
    <div v-if="result" class="mt-4">
        <p>Last prompt value: {{ result }}</p>
        <VBtn variant="text" class="mt-2" @click="reset">Reset</VBtn>
    </div>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { useDialog } from '@/composables/dialog/useDialog'
    import PromptDialogContent from '@/composables/dialog/docs/examples/PromptDialogContent.vue'
    import PromptDialogLargeContent from '@/composables/dialog/docs/examples/PromptDialogLargeContent.vue'
    import { VBtn } from 'vuetify/components'

    const dialog = useDialog()
    const result = ref<unknown>(null)

    function reset(): void {
        result.value = null
    }

    async function openPromptDialog(): Promise<void> {
        result.value = await dialog.prompt({
            component: PromptDialogContent,
            props: {
                label: 'Name',
            },
            initialValue: 'Contact request',
            title: 'Rename inbound form',
            translateTitle: false,
            required: true,
        })
    }

    async function openLargePromptDialog(): Promise<void> {
        result.value = await dialog.prompt({
            component: PromptDialogLargeContent,
            title: 'Choose a template',
            translateTitle: false,
            width: 'lg',
        })
    }
</script>
