import { describe, expect, it } from 'vitest'
import { toErrorMessage } from '@/internal/toErrorMessage'

describe('toErrorMessage', () => {
    const fallback = 'error.unknown'

    it('reads the message of an Error', () => {
        expect(toErrorMessage(new Error('boom'), fallback)).toBe('boom')
    })

    it('returns strings as they are', () => {
        expect(toErrorMessage('plain', fallback)).toBe('plain')
    })

    it('reads a message property from error-like objects', () => {
        expect(toErrorMessage({ message: 'from object', status: 500 }, fallback)).toBe('from object')
    })

    it('falls back to the given text for anything else', () => {
        expect(toErrorMessage(42, fallback)).toBe(fallback)
        expect(toErrorMessage(null, fallback)).toBe(fallback)
        expect(toErrorMessage({ message: 7 }, fallback)).toBe(fallback)
    })
})
