import { describe, expect, it } from 'vitest'
import { createId } from '@/internal/createId'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe('createId', () => {
    it('returns a version 4 UUID', () => {
        expect(createId()).toMatch(UUID_PATTERN)
    })

    it('returns a different id on every call', () => {
        const ids = new Set(Array.from({ length: 100 }, () => createId()))
        expect(ids.size).toBe(100)
    })

    it('falls back to getRandomValues when randomUUID is unavailable', () => {
        Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true })
        try {
            expect(createId()).toMatch(UUID_PATTERN)
        } finally {
            Reflect.deleteProperty(crypto, 'randomUUID')
        }
    })
})
