import { h } from 'vue'
import StoryWrapper from './StoryWrapper.vue'
import type { Decorator } from '@storybook/vue3'

const DARK_THEME_VALUE = '#121212'

export const withVuetify: Decorator = (storyFn, context) => {
    const story = storyFn()
    const theme = context.globals.backgrounds?.value === DARK_THEME_VALUE ? 'dark' : 'light'

    return () => h(StoryWrapper, { theme }, { story: () => h(story, context.args) })
}
