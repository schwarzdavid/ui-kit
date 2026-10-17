import type { VuetifyOptions } from 'vuetify'
import { cloneDeep, merge } from 'lodash-es'
import { darkTheme, lightTheme } from '@/vuetify/themes'
import { defaults } from '@/vuetify/defaults'
import { icons } from '@/vuetify/icons'

export function createVuetifyOptions(overrides: VuetifyOptions = {}): VuetifyOptions {
    const { icons: iconOverrides, ...rest } = overrides
    const base: VuetifyOptions = {
        theme: {
            defaultTheme: 'system',
            themes: {
                light: cloneDeep(lightTheme),
                dark: cloneDeep(darkTheme),
            },
        },
        defaults: cloneDeep(defaults),
    }
    const merged: VuetifyOptions = merge(base, rest)
    merged.icons = {
        ...iconOverrides,
        defaultSet: iconOverrides?.defaultSet ?? icons.defaultSet,
        aliases: { ...icons.aliases, ...iconOverrides?.aliases },
        sets: { ...icons.sets, ...iconOverrides?.sets },
    }
    return merged
}
