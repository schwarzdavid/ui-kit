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
import { useDialog } from '../../useDialog'
import { PromptDialogSize } from '../../presets/PromptDialogProps'
import PromptDialogContent from './PromptDialogContent.vue'
import PromptDialogLargeContent from './PromptDialogLargeContent.vue'

const dialog = useDialog()
const result = ref<unknown>(null)

async function openPromptDialog(): Promise<void> {
    result.value = await dialog.prompt({
        component: PromptDialogContent,
        props: {
            label: 'Example translated input',
        },
        initialValue: {},
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
