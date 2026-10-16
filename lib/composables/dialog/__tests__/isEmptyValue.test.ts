import { describe, expect, it } from 'vitest'
import { isEmptyValue } from '@/composables/dialog/internal/isEmptyValue'

describe('isEmptyValue', () => {
    it.each([
        null,
        undefined,
        '',
        [],
        {},
        Object.create(null),
        new Map(),
        new Set(),
        new Date('invalid'),
    ])('treats %s as empty', (value) => {
        expect(isEmptyValue(value)).toBe(true)
    })

    it.each([
        0,
        false,
        'text',
        [0],
        { key: 1 },
        new Map([['a', 1]]),
        new Set([1]),
        new Date(0),
        new File([], 'empty.txt'),
        new URL('https://example.com'),
        Object.create({
            get id(): number {
                return 1
            },
        }) as object,
    ])('treats %s as a value', (value) => {
        expect(isEmptyValue(value)).toBe(false)
    })
})
