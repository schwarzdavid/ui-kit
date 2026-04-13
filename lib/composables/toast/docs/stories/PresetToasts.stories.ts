import type { Meta, StoryObj } from '@storybook/vue3-vite'
import PresetExamples from '@/composables/toast/docs/examples/PresetExamples.vue'

const meta: Meta<typeof PresetExamples> = {
    component: PresetExamples,
    tags: ['hidden'],
}

export default meta

export const Default: StoryObj<typeof PresetExamples> = {}
