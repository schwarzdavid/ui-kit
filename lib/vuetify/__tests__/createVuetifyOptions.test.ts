import { describe, expect, it } from 'vitest'
import { createVuetify } from 'vuetify'
import { createVuetifyOptions } from '@/vuetify/createVuetifyOptions'
import { defaults } from '@/vuetify/defaults'
import { icons } from '@/vuetify/icons'
import { darkTheme, lightTheme } from '@/vuetify/themes'

describe('createVuetifyOptions', () => {
    it('returns the design system theme, icons and defaults', () => {
        const options = createVuetifyOptions()
        expect(options.theme).toEqual({ defaultTheme: 'system', themes: { light: lightTheme, dark: darkTheme } })
        expect(options.icons).toEqual(icons)
        expect(options.defaults).toEqual(defaults)
    })

    it('sets the mobile breakpoint to sm', () => {
        expect(createVuetifyOptions().display?.mobileBreakpoint).toBe('sm')
    })

    it('lets consumers override the mobile breakpoint', () => {
        expect(createVuetifyOptions({ display: { mobileBreakpoint: 'md' } }).display?.mobileBreakpoint).toBe('md')
    })

    it('deep-merges overrides over the base', () => {
        const options = createVuetifyOptions({
            theme: { defaultTheme: 'light' },
            defaults: { VBtn: { size: 'large' } },
        })
        expect(options.theme).toMatchObject({ defaultTheme: 'light', themes: { light: lightTheme } })
        expect(options.defaults?.VBtn).toEqual({ variant: 'outlined', color: 'ink', rounded: 'md', size: 'large' })
    })

    it('never mutates the exported base objects', () => {
        createVuetifyOptions({
            defaults: { VBtn: { size: 'large' } },
            theme: { themes: { light: { colors: { primary: '#000000' } } } },
        })
        expect(defaults.VBtn).not.toHaveProperty('size')
        expect(lightTheme.colors?.primary).toBe('#ffcf00')
        expect(createVuetifyOptions().defaults?.VBtn).not.toHaveProperty('size')
    })

    it('merges consumer aliases and sets over the mdi-svg icon set', () => {
        const SomeComponent = (): null => null
        const mine = { component: SomeComponent }
        const result = createVuetifyOptions({ icons: { aliases: { custom: 'svg:M0 0' }, sets: { mine } } }).icons
        expect(result?.aliases?.close).toBe(icons.aliases?.close)
        expect(result?.aliases?.custom).toBe('svg:M0 0')
        expect(result?.sets?.mdi).toBe(icons.sets?.mdi)
        expect(result?.sets?.mine).toBe(mine)
        expect(icons.aliases).not.toHaveProperty('custom')
        expect(icons.sets).not.toHaveProperty('mine')
    })

    it('lets the consumer change the default icon set', () => {
        const result = createVuetifyOptions({ icons: { defaultSet: 'mine' } }).icons
        expect(result?.defaultSet).toBe('mine')
        expect(result?.sets?.mdi).toBe(icons.sets?.mdi)
    })

    it('configures the mdi-svg icon set', () => {
        expect(icons.defaultSet).toBe('mdi')
        expect(icons.aliases?.close).toMatch(/^svg:/)
    })

    it('marks the active list item with primary-container and keeps its text and checkbox in ink', () => {
        expect(defaults.VList).toMatchObject({ color: 'ink', activeClass: 'bg-primary-container' })
        expect(defaults.VListItem).toMatchObject({ color: 'ink', activeClass: 'bg-primary-container' })
        expect(defaults.VSelect).toMatchObject({ itemColor: 'ink' })
        expect(defaults.VAutocomplete).toMatchObject({ itemColor: 'ink' })
        expect(defaults.VCombobox).toMatchObject({ itemColor: 'ink' })
    })

    it('styles button groups like secondary buttons, flattens expansion panels, colours both switch states, draws dividers in border and keeps progress tracks translucent', () => {
        expect(defaults.VBtnGroup).toMatchObject({ variant: 'text', color: 'ink', border: 'thin border-strong', divided: true })
        expect(defaults.VExpansionPanels).toMatchObject({ flat: true, class: 'border' })
        expect(defaults.VSwitch).toMatchObject({ color: 'ink', baseColor: 'border-strong' })
        expect(defaults.VDivider).toEqual({ color: 'border' })
        expect(defaults.VProgressLinear).toEqual({ bgOpacity: 0.12, bufferOpacity: 0.12 })
    })

    it('never sets a global VBtn border default', () => {
        expect(defaults.VBtn).not.toHaveProperty('border')
    })

    it('creates a Vuetify instance', () => {
        expect(() => createVuetify(createVuetifyOptions())).not.toThrow()
    })
})
