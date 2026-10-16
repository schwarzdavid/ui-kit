<template>
    <div class="d-flex gc-4">
        <VBtn color="primary" @click="openPromptDialog">Translated Input</VBtn>
        <VBtn color="primary" @click="openLargePromptDialog">Complex Prompt</VBtn>
    </div>
    <div v-if="result" class="mt-4">
        <p>Last prompt value: {{ result }}</p>
        <!-- eslint-disable-next-line vue/v-on-handler-style -->
        <VBtn color="secondary" class="mt-2" @click="result = null">Reset</VBtn>
    </div>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { useDialog } from '@/composables/dialog/useDialog'
    import { PromptDialogSize } from '@/composables/dialog/presets/PromptDialogProps'
    import PromptDialogContent from '@/composables/dialog/docs/examples/PromptDialogContent.vue'
    import PromptDialogLargeContent from '@/composables/dialog/docs/examples/PromptDialogLargeContent.vue'
    import { VBtn } from 'vuetify/components'

    const dialog = useDialog()
    const result = ref<unknown>(null)

    async function openPromptDialog(): Promise<void> {
        result.value = await dialog.prompt({
            component: PromptDialogContent,
            props: {
                label: 'Example translated input',
            },
            initialValue: '',
            title: 'Testprompt',
            translateTitle: false,
        })
    }

    async function openLargePromptDialog(): Promise<void> {
        result.value = await dialog.prompt({
            component: PromptDialogLargeContent,
            props: {},
            title: 'Large prompt',
            translateTitle: false,
            size: PromptDialogSize.LARGE,
        })
    }
</script>
