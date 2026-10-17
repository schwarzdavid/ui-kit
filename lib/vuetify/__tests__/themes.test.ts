import { describe, expect, it } from 'vitest'
import { darkTheme, lightTheme } from '@/vuetify/themes'
import { themeVariables } from '@/vuetify/variables'

const TOKENS = [
    'primary', 'primary-hover', 'primary-pressed', 'on-primary', 'primary-container', 'on-primary-container',
    'secondary', 'on-secondary', 'background', 'on-background', 'surface', 'on-surface',
    'surface-bright', 'surface-light', 'surface-variant', 'on-surface-variant',
    'surface-hover', 'surface-sunken', 'surface-overlay', 'surface-inverse', 'on-surface-inverse', 'inverse-primary',
    'scrim', 'ink', 'ink-muted', 'ink-disabled', 'border', 'border-strong', 'disabled-surface', 'focus',
    'success', 'on-success', 'success-container', 'warning', 'on-warning', 'warning-container',
    'error', 'on-error', 'error-container', 'info', 'on-info', 'info-container',
]

describe('themes', () => {
    it.each([
        ['light', lightTheme, false],
        ['dark', darkTheme, true],
    ])('%s defines every design token exactly once', (_name, theme, dark) => {
        expect(theme.dark).toBe(dark)
        expect(Object.keys(theme.colors ?? {}).sort()).toEqual([...TOKENS].sort())
    })

    it.each([
        ['light', lightTheme],
        ['dark', darkTheme],
    ])('%s uses six-digit hex colours only', (_name, theme) => {
        for (const value of Object.values(theme.colors ?? {})) {
            expect(value).toMatch(/^#[0-9a-f]{6}$/)
        }
    })

    it('shares the opacity and font variables between both themes', () => {
        expect(lightTheme.variables).toMatchObject(themeVariables)
        expect(darkTheme.variables).toMatchObject(themeVariables)
        expect(themeVariables['font-body']).toContain('Noto Sans')
        expect(themeVariables['font-heading']).toBe(themeVariables['font-body'])
    })

    it('keeps the brand yellow and dark on-primary in both themes', () => {
        expect(lightTheme.colors?.primary).toBe('#ffcf00')
        expect(darkTheme.colors?.primary).toBe('#ffcf00')
        expect(lightTheme.colors?.['on-primary']).toBe('#1d1b16')
        expect(darkTheme.colors?.['on-primary']).toBe('#1d1b16')
    })

    it('defines the shadow variables per theme', () => {
        expect(lightTheme.variables?.['shadow-lg']).toBe('0 4px 8px rgba(29, 27, 22, 0.08), 0 24px 48px rgba(29, 27, 22, 0.18)')
        expect(darkTheme.variables?.['shadow-lg']).toBe('0 4px 8px rgba(0, 0, 0, 0.5), 0 24px 48px rgba(0, 0, 0, 0.6)')
        expect(lightTheme.variables?.['shadow-color']).toBe('#1d1b16')
        expect(darkTheme.variables?.['shadow-color']).toBe('#000000')
    })
})
