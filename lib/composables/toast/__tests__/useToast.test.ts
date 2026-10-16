import { describe, expect, it } from 'vitest'
import { useToast } from '@/composables/toast/useToast'
import { useToastQueue } from '@/composables/toast/internal/useToastQueue'
import { ToastType } from '@/composables/toast/types/ToastType'
import { createTestApp } from '@/__tests__/helpers/createTestApp'

describe('useToast', () => {
    it.each([
        ['info', ToastType.INFO],
        ['warn', ToastType.WARNING],
        ['error', ToastType.ERROR],
        ['success', ToastType.SUCCESS],
    ] as const)('%s queues an entry of the matching type with plugin defaults', (method, type) => {
        const app = createTestApp({ toast: { timeout: 1234 } })
        const toast = app.runWithContext(() => useToast())
        const queue = app.runWithContext(() => useToastQueue())
        void toast[method]('msg')
        expect(queue.queue.value[0]).toMatchObject({ message: 'msg', type, timeout: 1234, translateMessage: true })
    })

    it('per-call options override plugin defaults', () => {
        const app = createTestApp()
        const toast = app.runWithContext(() => useToast())
        const queue = app.runWithContext(() => useToastQueue())
        void toast.info('msg', { timeout: 5, translateMessage: false })
        expect(queue.queue.value[0]).toMatchObject({ timeout: 5, translateMessage: false })
    })

    it('the returned promise resolves when the entry is resolved', async () => {
        const app = createTestApp()
        const toast = app.runWithContext(() => useToast())
        const queue = app.runWithContext(() => useToastQueue())
        const pending = toast.success('msg')
        queue.queue.value[0].resolve()
        await expect(pending).resolves.toBeUndefined()
        expect(queue.queue.value).toHaveLength(0)
    })
})
