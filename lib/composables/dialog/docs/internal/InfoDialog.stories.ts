import InfoDialogExample from '../examples/InfoDialogExample.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<typeof InfoDialogExample> = {
    component: InfoDialogExample,
    tags: ['hidden'],
}

export default meta

export const Default: StoryObj<typeof InfoDialogExample> = {}
