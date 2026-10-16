import InfoDialogExample from '@/composables/dialog/docs/examples/InfoDialogExample.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta: Meta<typeof InfoDialogExample> = {
    component: InfoDialogExample,
    tags: ['hidden'],
}

export default meta

export const Default: StoryObj<typeof InfoDialogExample> = {}
