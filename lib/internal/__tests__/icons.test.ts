import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { VIcon } from 'vuetify/components'
import { mdiClose } from '@mdi/js'
import { Icons, svgIcon } from '@/internal/icons'

describe('icons', () => {
    it('prefixes a path for the svg icon set', () => {
        expect(svgIcon('M1 1')).toBe('svg:M1 1')
        expect(Icons.close).toBe(`svg:${mdiClose}`)
    })

    it('renders as an svg path under a stock Vuetify instance with its class-based icon set', () => {
        const wrapper = mount(VIcon, { props: { icon: Icons.close }, global: { plugins: [createVuetify()] } })
        const path = wrapper.find('svg path')
        expect(path.exists()).toBe(true)
        expect(path.attributes('d')).toBe(mdiClose)
    })

    it('uses outline glyphs for the status icons', () => {
        expect(Object.keys(Icons).sort()).toEqual(['close', 'error', 'info', 'success', 'warning'])
        for (const icon of Object.values(Icons)) {
            expect(icon).toMatch(/^svg:M/)
        }
    })
})
