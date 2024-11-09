import { addons } from '@storybook/manager-api'
import { create } from '@storybook/theming'
import Logo from './logo.svg'

const theme = create({
    base: 'light',
    brandImage: Logo,
})

addons.setConfig({
    theme,
    sidebar: {
        filters: {
            patterns: item => !item.tags?.includes('hidden'),
        },
    },
})
