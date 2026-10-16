import type { Meta, StoryObj } from '@storybook/vue3-vite'
import LoadingExample from '@/composables/loading/docs/examples/LoadingExample.vue'

const meta: Meta<typeof LoadingExample> = {
    component: LoadingExample,
    tags: ['hidden'],
}

export default meta

export const Default: StoryObj<typeof LoadingExample> = {}
