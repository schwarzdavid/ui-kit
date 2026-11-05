import ResponsiveInfoExample from '@/components/sheet/docs/examples/ResponsiveInfoExample.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta: Meta<typeof ResponsiveInfoExample> = {
    component: ResponsiveInfoExample,
    tags: ['hidden'],
    globals: {
        viewport: { value: 'mobile1', isRotated: false },
    },
}

export default meta

export const Default: StoryObj<typeof ResponsiveInfoExample> = {}
