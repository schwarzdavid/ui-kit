import { describe, expect, expectTypeOf, it } from 'vitest'
import { type Component, defineComponent, h } from 'vue'
import type { ComponentProps } from 'vue-component-type-helpers'
import type { DialogProps } from '@/composables/dialog/types/DialogProps'

const NoProps = defineComponent({
    setup: () => () => h('div'),
})

const RequiredProps = defineComponent({
    props: { foo: { type: Number, required: true } },
    setup: () => () => h('div'),
})

const OptionalProps = defineComponent({
    props: { foo: { type: Number, default: 1 } },
    setup: () => () => h('div'),
})

type Options<P extends object> = DialogProps<P> & { title: string }

type NoPropsOptions = Options<ComponentProps<typeof NoProps>>
type RequiredPropsOptions = Options<ComponentProps<typeof RequiredProps>>
type OptionalPropsOptions = Options<ComponentProps<typeof OptionalProps>>

describe('DialogProps', () => {
    it('lets a component without props be used without a props key', () => {
        expect(NoProps.props).toBeUndefined()
        expectTypeOf<{ title: string }>().toExtend<NoPropsOptions>()
    })

    it('requires the props key for a component with a required prop', () => {
        expect(RequiredProps.props).toHaveProperty('foo.required', true)
        expectTypeOf<{ title: string }>().not.toExtend<RequiredPropsOptions>()
        expectTypeOf<{ title: string, props: { foo: number } }>().toExtend<RequiredPropsOptions>()
    })

    it('makes the props key optional when every prop is optional', () => {
        expect(OptionalProps.props).toHaveProperty('foo.default', 1)
        expectTypeOf<{ title: string }>().toExtend<OptionalPropsOptions>()
        expectTypeOf<{ title: string, props: { foo: number } }>().toExtend<OptionalPropsOptions>()
    })

    it('does not count the built-in props class, style, key and ref', () => {
        expectTypeOf<keyof NonNullable<RequiredPropsOptions['props']>>().toEqualTypeOf<'foo'>()
    })

    it('keeps the props key optional for the generic Component type used by explicit type arguments', () => {
        expectTypeOf<{ title: string }>().toExtend<Options<ComponentProps<Component>>>()
    })
})
