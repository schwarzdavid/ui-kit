import ResponsiveMenuExample from '@/components/sheet/docs/examples/ResponsiveMenuExample.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta: Meta<typeof ResponsiveMenuExample> = {
    component: ResponsiveMenuExample,
    tags: ['hidden'],
    globals: {
        viewport: { value: 'mobile1', isRotated: false },
    },
}

export default meta

export const Default: StoryObj<typeof ResponsiveMenuExample> = {}
