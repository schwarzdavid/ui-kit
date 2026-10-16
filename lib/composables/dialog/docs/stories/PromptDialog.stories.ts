import PromptDialogExample from '@/composables/dialog/docs/examples/PromptDialogExample.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta: Meta<typeof PromptDialogExample> = {
    component: PromptDialogExample,
    tags: ['hidden'],
}

export default meta

export const Default: StoryObj<typeof PromptDialogExample> = {}
