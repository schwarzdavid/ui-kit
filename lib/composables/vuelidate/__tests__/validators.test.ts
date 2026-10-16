import { describe, expect, it } from 'vitest'
import type { MessageProps } from '@vuelidate/validators'
import { macAddress, minLength, required, setGlobalValidationSettings } from '@/composables/vuelidate/validators'

function messageProps(validator: string): MessageProps {
    return {
        $invalid: true,
        $model: '',
        $params: {},
        $pending: false,
        $property: 'field',
        $propertyPath: 'field',
        $response: null,
        $validator: validator,
    }
}

function resolveMessage(rule: { $message?: unknown }, validator: string): string {
    const message = rule.$message
    return typeof message === 'function' ? String(message(messageProps(validator))) : String(message)
}

describe('validators', () => {
    it('builds the message path with the default prefix and no transform', () => {
        setGlobalValidationSettings({ t: path => `translated:${path}` })
        expect(resolveMessage(minLength(3), 'minLength')).toBe('translated:validation.minLength')
    })

    it.each([
        ['snake_case', 'validation.min_length'],
        ['kebab-case', 'validation.min-length'],
        ['PascalCase', 'validation.MinLength'],
        ['camelCase', 'validation.minLength'],
        ['none', 'validation.minLength'],
    ] as const)('applies the %s transform', (transform, expected) => {
        setGlobalValidationSettings({ t: path => path, message: { prefix: 'validation', transform } })
        expect(resolveMessage(required, 'minLength')).toBe(expected)
    })

    it('uses a custom prefix with the default transform', () => {
        setGlobalValidationSettings({ t: path => path, message: { prefix: 'errors' } })
        expect(resolveMessage(required, 'required')).toBe('errors.required')
    })

    it('supports a custom message path function', () => {
        setGlobalValidationSettings({ t: path => path, message: name => `custom.${name}` })
        expect(resolveMessage(required, 'required')).toBe('custom.required')
    })

    it('exports macAddress as a validator factory', () => {
        const rule = macAddress(':')
        expect(rule.$validator('00:1A:2B:3C:4D:5E', {}, {})).toBe(true)
        expect(rule.$validator('nope', {}, {})).toBe(false)
    })
})
