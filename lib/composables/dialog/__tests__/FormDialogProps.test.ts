import { describe, expect, expectTypeOf, it } from 'vitest'
import { defineComponent, h, type PropType } from 'vue'
import type { FormDialogProps } from '@/composables/dialog/presets/FormDialogProps'
import type { DialogComposable } from '@/composables/dialog/useDialog'

const StringModel = defineComponent({
    props: {
        modelValue: { type: String as PropType<string | null>, default: null },
        label: { type: String, required: true },
    },
    emits: ['update:modelValue'],
    setup: () => () => h('input'),
})

const FinishForm = defineComponent({
    setup: () => () => h('form'),
})

type Form = DialogComposable['form']

describe('FormDialogProps', () => {
    it('infers the value type from initialValue and makes the result non-null when required', () => {
        expect(StringModel.props).toHaveProperty('modelValue')
        expectTypeOf(callRequired).returns.toEqualTypeOf<Promise<string>>()
        expectTypeOf(callOptional).returns.toEqualTypeOf<Promise<string | null>>()
    })

    it('infers the result type from action', () => {
        expectTypeOf(callAction).returns.toEqualTypeOf<Promise<number | null>>()
    })

    it('rejects a component whose modelValue does not match the value type', () => {
        expectTypeOf<{ title: string, component: typeof StringModel, props: { label: string } }>()
            .toExtend<FormDialogProps<string, string, false, typeof StringModel>>()
        expectTypeOf<{ title: string, component: typeof StringModel, props: { label: string } }>()
            .not.toExtend<FormDialogProps<number, number, false, typeof StringModel>>()
    })

    it('omits modelValue and toolbar from props and accepts components without a model', () => {
        expectTypeOf<keyof NonNullable<FormDialogProps<string, string, false, typeof StringModel>['props']>>().toEqualTypeOf<'label'>()
        expectTypeOf<{ title: string, component: typeof FinishForm }>()
            .toExtend<FormDialogProps<number, number, false, typeof FinishForm>>()
    })
})

function callRequired(form: Form) {
    return form({ title: 't', component: StringModel, props: { label: 'l' }, initialValue: 'x', required: true })
}

function callOptional(form: Form) {
    return form({ title: 't', component: StringModel, props: { label: 'l' }, initialValue: 'x' })
}

function callAction(form: Form) {
    return form({ title: 't', component: FinishForm, action: (value: string) => Promise.resolve(value.length) })
}
