import { type Component, h } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ThemeColors from '@/docs/examples/theme/ThemeColors.vue'
import ThemeTypography from '@/docs/examples/theme/ThemeTypography.vue'
import ThemeButtons from '@/docs/examples/theme/ThemeButtons.vue'
import ThemeFields from '@/docs/examples/theme/ThemeFields.vue'
import ThemeSelection from '@/docs/examples/theme/ThemeSelection.vue'
import ThemeFeedback from '@/docs/examples/theme/ThemeFeedback.vue'
import ThemeContainers from '@/docs/examples/theme/ThemeContainers.vue'
import ThemeDataTable from '@/docs/examples/theme/ThemeDataTable.vue'
import ThemeOverlays from '@/docs/examples/theme/ThemeOverlays.vue'

const meta: Meta = {
    tags: ['hidden'],
}

export default meta

function story(component: Component): StoryObj {
    return {
        render: () => ({
            setup: () => () => h(component),
        }),
    }
}

export const Colors = story(ThemeColors)
export const Typography = story(ThemeTypography)
export const Buttons = story(ThemeButtons)
export const Fields = story(ThemeFields)
export const Selection = story(ThemeSelection)
export const Feedback = story(ThemeFeedback)
export const Containers = story(ThemeContainers)
export const DataTable = story(ThemeDataTable)
export const Overlays = story(ThemeOverlays)
