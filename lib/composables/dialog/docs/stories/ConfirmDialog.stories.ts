import ConfirmDialogExample from '../examples/ConfirmDialogExample.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta: Meta<typeof ConfirmDialogExample> = {
    component: ConfirmDialogExample,
    tags: ['hidden'],
}

export default meta

export const Default: StoryObj<typeof ConfirmDialogExample> = {}
