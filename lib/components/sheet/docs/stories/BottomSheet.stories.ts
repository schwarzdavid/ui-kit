import BottomSheetExample from '@/components/sheet/docs/examples/BottomSheetExample.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta: Meta<typeof BottomSheetExample> = {
    component: BottomSheetExample,
    tags: ['hidden'],
    globals: {
        viewport: { value: 'mobile1', isRotated: false },
    },
}

export default meta

export const Default: StoryObj<typeof BottomSheetExample> = {}
