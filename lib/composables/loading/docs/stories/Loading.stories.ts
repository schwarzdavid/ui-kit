import type { Meta, StoryObj } from '@storybook/vue3'
import LoadingExample from '../examples/LoadingExample.vue'

const meta: Meta<typeof LoadingExample> = {
    component: LoadingExample,
    tags: ['hidden'],
}

export default meta

export const Default: StoryObj<typeof LoadingExample> = {}
