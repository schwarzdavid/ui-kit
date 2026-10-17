import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CustomPresetsExample from '@/docs/examples/CustomPresetsExample.vue'

const meta: Meta<typeof CustomPresetsExample> = {
    component: CustomPresetsExample,
    tags: ['hidden'],
}

export default meta

export const Default: StoryObj<typeof CustomPresetsExample> = {}
