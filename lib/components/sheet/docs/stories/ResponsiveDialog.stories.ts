import ResponsiveFormExample from '@/components/sheet/docs/examples/ResponsiveFormExample.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta: Meta<typeof ResponsiveFormExample> = {
    component: ResponsiveFormExample,
    tags: ['hidden'],
    globals: {
        viewport: { value: 'mobile1', isRotated: false },
    },
}

export default meta

export const Default: StoryObj<typeof ResponsiveFormExample> = {}
