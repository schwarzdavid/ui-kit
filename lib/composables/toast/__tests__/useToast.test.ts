import { afterEach, describe, expect, it, vi } from 'vitest'
import { useToast } from '@/composables/toast/useToast'
import { useToastQueue } from '@/composables/toast/internal/useToastQueue'
import { ToastType } from '@/composables/toast/types/ToastType'
import { createTestApp } from '@/__tests__/helpers/createTestApp'
import type { CreateUIKitOptions } from '@/plugin/types/PluginOptions'

function setup(options?: CreateUIKitOptions) {
    const app = createTestApp(options)
    return {
        toast: app.runWithContext(() => useToast()),
        queue: app.runWithContext(() => useToastQueue()),
    }
}

describe('useToast', () => {
    it.each([
        ['info', ToastType.INFO],
        ['warn', ToastType.WARNING],
        ['success', ToastType.SUCCESS],
    ] as const)('%s queues an entry of the matching type with the plugin timeout', (method, type) => {
        const { toast, queue } = setup({ toast: { timeout: 1234 } })
        void toast[method]('msg')
        expect(queue.queue.value[0]).toMatchObject({ message: 'msg', type, timeout: 1234, translateMessage: true })
        expect(queue.queue.value[0].action).toBeUndefined()
    })

    it('uses errorTimeout for error toasts, which is false by default', () => {
        const { toast, queue } = setup()
        void toast.error('msg')
        expect(queue.queue.value[0]).toMatchObject({ type: ToastType.ERROR, timeout: false })
    })

    it('uses a configured errorTimeout', () => {
        const { toast, queue } = setup({ toast: { errorTimeout: 8000 } })
        void toast.error('msg')
        expect(queue.queue.value[0].timeout).toBe(8000)
    })

    it('per-call timeout overrides errorTimeout', () => {
        const { toast, queue } = setup()
        void toast.error('msg', { timeout: 3000 })
        expect(queue.queue.value[0].timeout).toBe(3000)
    })

    it('passes translateMessage, a timeout of false and the action through', () => {
        const { toast, queue } = setup()
        const action = { text: 'Undo', translateText: false, handler: vi.fn() }
        void toast.info('msg', { timeout: false, translateMessage: false, action })
        expect(queue.queue.value[0]).toMatchObject({ timeout: false, translateMessage: false, action })
    })

    it('resolves false when the entry is closed', async () => {
        const { toast, queue } = setup()
        const pending = toast.success('msg')
        queue.close(queue.queue.value[0].id)
        await expect(pending).resolves.toBe(false)
        expect(queue.queue.value).toHaveLength(0)
    })

    describe('timers', () => {
        afterEach(() => {
            vi.useRealTimers()
        })

        it('an error toast with a per-call timeout closes itself after that time', async () => {
            vi.useFakeTimers()
            const { toast, queue } = setup()
            const pending = toast.error('msg', { timeout: 3000 })
            vi.advanceTimersByTime(2999)
            expect(queue.queue.value).toHaveLength(1)
            vi.advanceTimersByTime(1)
            await expect(pending).resolves.toBe(false)
            expect(queue.queue.value).toHaveLength(0)
        })
    })

    it('resolves true when the action is triggered', async () => {
        const { toast, queue } = setup()
        const pending = toast.success('msg', { action: { text: 'Undo' } })
        queue.trigger(queue.queue.value[0].id)
        await expect(pending).resolves.toBe(true)
    })
})
