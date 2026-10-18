import DialogStackingExample from '@/composables/dialog/docs/examples/DialogStackingExample.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta: Meta<typeof DialogStackingExample> = {
    component: DialogStackingExample,
    tags: ['hidden'],
}

export default meta

export const Default: StoryObj<typeof DialogStackingExample> = {}
