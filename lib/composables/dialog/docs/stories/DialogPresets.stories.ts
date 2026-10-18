import DialogPresetsExample from '@/composables/dialog/docs/examples/DialogPresetsExample.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta: Meta<typeof DialogPresetsExample> = {
    component: DialogPresetsExample,
    tags: ['hidden'],
}

export default meta

export const Default: StoryObj<typeof DialogPresetsExample> = {}
