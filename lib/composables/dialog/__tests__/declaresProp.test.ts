import { describe, expect, it } from 'vitest'
import { type Component, defineComponent, h, type FunctionalComponent } from 'vue'
import { declaresProp } from '@/composables/dialog/internal/declaresProp'

describe('declaresProp', () => {
    it('finds a prop declared in object syntax', () => {
        const component = defineComponent({ props: { modelValue: { type: String, default: null } }, setup: () => () => h('div') })
        expect(declaresProp(component, 'modelValue')).toBe(true)
        expect(declaresProp(component, 'toolbar')).toBe(false)
    })

    it('finds a prop declared in array syntax', () => {
        const component: Component = { props: ['toolbar'], render: () => h('div') }
        expect(declaresProp(component, 'toolbar')).toBe(true)
        expect(declaresProp(component, 'modelValue')).toBe(false)
    })

    it('returns false for components without declared props', () => {
        const component = defineComponent({ setup: () => () => h('div') })
        const functional: FunctionalComponent = () => h('div')
        expect(declaresProp(component, 'modelValue')).toBe(false)
        expect(declaresProp(functional, 'modelValue')).toBe(false)
    })
})
