import FormDialogExample from '../examples/FormDialogExample.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<typeof FormDialogExample> = {
    component: FormDialogExample,
    tags: ['hidden'],
}

export default meta

export const Default: StoryObj<typeof FormDialogExample> = {}
