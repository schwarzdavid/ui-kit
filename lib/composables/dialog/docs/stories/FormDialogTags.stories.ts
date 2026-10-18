import FormDialogTagsExample from '@/composables/dialog/docs/examples/FormDialogTagsExample.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta: Meta<typeof FormDialogTagsExample> = {
    component: FormDialogTagsExample,
    tags: ['hidden'],
}

export default meta

export const Default: StoryObj<typeof FormDialogTagsExample> = {}
