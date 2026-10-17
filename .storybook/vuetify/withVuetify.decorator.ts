import { h } from 'vue'
import StoryWrapper from './StoryWrapper.vue'
import type { Decorator } from '@storybook/vue3-vite'

const DARK_BACKGROUND_KEY = 'dark'

export const withVuetify: Decorator = (storyFn, context) => {
    const story = storyFn()
    const theme = context.globals.backgrounds?.value === DARK_BACKGROUND_KEY ? 'dark' : 'light'

    return () => h(StoryWrapper, { theme }, { story: () => h(story, context.args) })
}
