import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { useSheetDrag } from '@/components/sheet/internal/useSheetDrag'

let now = 0

function pointer(type: string, clientY: number, target: EventTarget, pointerType = 'mouse', clientX = 0) {
    const event = new MouseEvent(type, { clientX, clientY, bubbles: true })
    Object.defineProperty(event, 'pointerId', { value: 1 })
    Object.defineProperty(event, 'pointerType', { value: pointerType })
    target.dispatchEvent(event)
}

function setup(initial = 0, dismissible = true) {
    const current = ref(initial)
    const onDismiss = vi.fn()
    let api!: ReturnType<typeof useSheetDrag>
    const wrapper = mount(defineComponent({
        setup() {
            const surface = ref<HTMLElement | null>(null)
            const body = ref<HTMLElement | null>(null)
            api = useSheetDrag({
                surface,
                body,
                heights: () => [400, 800],
                current,
                dismissible: ref(dismissible),
                onDismiss,
            })
            return () => h('div', { ref: surface, class: 'surface' }, [h('div', { ref: body, class: 'body' })])
        },
    }), { attachTo: document.body })
    const surface = wrapper.find('.surface').element as HTMLElement
    const body = wrapper.find('.body').element as HTMLElement
    return { wrapper, api, current, onDismiss, surface, body }
}

describe('useSheetDrag', () => {
    let wrapper: VueWrapper | undefined

    beforeEach(() => {
        now = 0
        vi.spyOn(performance, 'now').mockImplementation(() => now)
    })

    afterEach(() => {
        wrapper?.unmount()
        wrapper = undefined
        vi.restoreAllMocks()
    })

    it('tracks the drag offset while dragging', () => {
        const ctx = setup()
        wrapper = ctx.wrapper
        pointer('pointerdown', 100, ctx.surface)
        now = 300
        pointer('pointermove', 140, window)
        expect(ctx.api.dragging.value).toBe(true)
        expect(ctx.api.offset.value).toBe(40)
    })

    it('expands on an upward flick from the surface', () => {
        const ctx = setup()
        wrapper = ctx.wrapper
        pointer('pointerdown', 500, ctx.surface)
        now = 10
        pointer('pointermove', 480, window)
        pointer('pointerup', 480, window)
        expect(ctx.current.value).toBe(1)
        expect(ctx.api.dragging.value).toBe(false)
        expect(ctx.api.offset.value).toBe(0)
    })

    it('dismisses on a downward flick', () => {
        const ctx = setup()
        wrapper = ctx.wrapper
        pointer('pointerdown', 100, ctx.surface)
        now = 10
        pointer('pointermove', 130, window)
        pointer('pointerup', 130, window)
        expect(ctx.onDismiss).toHaveBeenCalledTimes(1)
        expect(ctx.api.offset.value).toBe(0)
    })

    it('does not dismiss on a downward flick when not dismissible', () => {
        const ctx = setup(0, false)
        wrapper = ctx.wrapper
        pointer('pointerdown', 100, ctx.surface)
        now = 10
        pointer('pointermove', 130, window)
        pointer('pointerup', 130, window)
        expect(ctx.onDismiss).not.toHaveBeenCalled()
        expect(ctx.current.value).toBe(0)
    })

    it('does not drag down from the body while it is scrolled', () => {
        const ctx = setup()
        wrapper = ctx.wrapper
        ctx.body.scrollTop = 50
        pointer('pointerdown', 100, ctx.body, 'touch')
        now = 10
        pointer('pointermove', 160, window)
        pointer('pointerup', 160, window)
        expect(ctx.api.dragging.value).toBe(false)
        expect(ctx.api.offset.value).toBe(0)
        expect(ctx.onDismiss).not.toHaveBeenCalled()
    })

    it('drags down from the body once scrolled to the top', () => {
        const ctx = setup()
        wrapper = ctx.wrapper
        ctx.body.scrollTop = 0
        pointer('pointerdown', 100, ctx.body, 'touch')
        now = 300
        pointer('pointermove', 160, window)
        expect(ctx.api.dragging.value).toBe(true)
    })

    it('expands from the body on an upward drag before scrolling', () => {
        const ctx = setup()
        wrapper = ctx.wrapper
        pointer('pointerdown', 500, ctx.body, 'touch')
        now = 10
        pointer('pointermove', 470, window)
        pointer('pointerup', 470, window)
        expect(ctx.current.value).toBe(1)
    })

    it('does not drag up from the body on the last stage', () => {
        const ctx = setup(1)
        wrapper = ctx.wrapper
        pointer('pointerdown', 500, ctx.body, 'touch')
        now = 10
        pointer('pointermove', 470, window)
        expect(ctx.api.dragging.value).toBe(false)
        expect(ctx.api.offset.value).toBe(0)
    })

    it('returns to the current stage on pointercancel', () => {
        const ctx = setup()
        wrapper = ctx.wrapper
        pointer('pointerdown', 100, ctx.surface)
        now = 300
        pointer('pointermove', 300, window)
        expect(ctx.api.dragging.value).toBe(true)
        pointer('pointercancel', 300, window)
        expect(ctx.api.dragging.value).toBe(false)
        expect(ctx.api.offset.value).toBe(0)
        expect(ctx.current.value).toBe(0)
        expect(ctx.onDismiss).not.toHaveBeenCalled()
    })

    it('ignores drags shorter than 8 px so taps still click', () => {
        const ctx = setup()
        wrapper = ctx.wrapper
        pointer('pointerdown', 100, ctx.surface)
        now = 10
        pointer('pointermove', 105, window)
        expect(ctx.api.dragging.value).toBe(false)
        expect(ctx.api.offset.value).toBe(0)
    })

    it('ignores pointerdown on form fields inside the body', () => {
        const ctx = setup()
        wrapper = ctx.wrapper
        const input = document.createElement('input')
        ctx.body.appendChild(input)
        pointer('pointerdown', 100, input, 'touch')
        now = 300
        pointer('pointermove', 200, window)
        expect(ctx.api.dragging.value).toBe(false)
    })

    it('does not drag from the body with a mouse', () => {
        const ctx = setup()
        wrapper = ctx.wrapper
        pointer('pointerdown', 100, ctx.body, 'mouse')
        now = 300
        pointer('pointermove', 200, window)
        expect(ctx.api.dragging.value).toBe(false)
    })

    it('drags from the surface with a mouse', () => {
        const ctx = setup()
        wrapper = ctx.wrapper
        pointer('pointerdown', 100, ctx.surface, 'mouse')
        now = 300
        pointer('pointermove', 200, window)
        expect(ctx.api.dragging.value).toBe(true)
    })

    function touchMove(target: EventTarget, clientY: number, clientX = 0) {
        const event = new Event('touchmove', { bubbles: true, cancelable: true })
        Object.defineProperty(event, 'touches', { value: [{ clientX, clientY }] })
        target.dispatchEvent(event)
        return event
    }

    it('prevents touchmove for an eligible body gesture', () => {
        const ctx = setup()
        wrapper = ctx.wrapper
        ctx.body.scrollTop = 0
        pointer('pointerdown', 100, ctx.body, 'touch')
        expect(touchMove(ctx.body, 110).defaultPrevented).toBe(true)
        expect(touchMove(ctx.body, 130).defaultPrevented).toBe(true)
    })

    it('lets the body scroll when it is scrolled', () => {
        const ctx = setup()
        wrapper = ctx.wrapper
        ctx.body.scrollTop = 50
        pointer('pointerdown', 100, ctx.body, 'touch')
        expect(touchMove(ctx.body, 110).defaultPrevented).toBe(false)
        expect(touchMove(ctx.body, 130).defaultPrevented).toBe(false)
    })

    it('prevents touchmove for a gesture from outside the body', () => {
        const ctx = setup()
        wrapper = ctx.wrapper
        pointer('pointerdown', 100, ctx.surface, 'touch')
        expect(touchMove(ctx.surface, 110).defaultPrevented).toBe(true)
    })

    it('swallows the click after a drag', () => {
        const ctx = setup()
        wrapper = ctx.wrapper
        const spy = vi.fn()
        ctx.body.addEventListener('click', spy)
        pointer('pointerdown', 100, ctx.surface)
        now = 300
        pointer('pointermove', 200, window)
        pointer('pointerup', 200, window)
        ctx.body.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }))
        expect(spy).not.toHaveBeenCalled()
    })

    it('keeps a keyboard-activated click after a drag', () => {
        const ctx = setup()
        wrapper = ctx.wrapper
        const spy = vi.fn()
        ctx.body.addEventListener('click', spy)
        pointer('pointerdown', 100, ctx.surface)
        now = 300
        pointer('pointermove', 200, window)
        pointer('pointerup', 200, window)
        ctx.body.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }))
        expect(spy).toHaveBeenCalledTimes(1)
        ctx.body.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }))
        expect(spy).toHaveBeenCalledTimes(2)
    })

    it('keeps the click after a plain tap', () => {
        const ctx = setup()
        wrapper = ctx.wrapper
        const spy = vi.fn()
        ctx.body.addEventListener('click', spy)
        pointer('pointerdown', 100, ctx.surface)
        pointer('pointerup', 100, window)
        ctx.body.click()
        expect(spy).toHaveBeenCalledTimes(1)
    })

    it('does not drag on a mostly horizontal touch gesture in the body', () => {
        const ctx = setup()
        wrapper = ctx.wrapper
        ctx.body.scrollTop = 0
        pointer('pointerdown', 100, ctx.body, 'touch', 100)
        expect(touchMove(ctx.body, 104, 103).defaultPrevented).toBe(false)
        expect(touchMove(ctx.body, 106, 130).defaultPrevented).toBe(false)
        pointer('pointermove', 106, window, 'touch', 130)
        expect(touchMove(ctx.body, 115, 170).defaultPrevented).toBe(false)
        pointer('pointermove', 115, window, 'touch', 170)
        expect(ctx.api.dragging.value).toBe(false)
        expect(ctx.api.offset.value).toBe(0)
    })

    it('does not drag on a mostly horizontal gesture from the handle', () => {
        const ctx = setup()
        wrapper = ctx.wrapper
        pointer('pointerdown', 100, ctx.surface, 'touch', 100)
        now = 50
        pointer('pointermove', 106, window, 'touch', 140)
        pointer('pointermove', 130, window, 'touch', 200)
        pointer('pointerup', 130, window, 'touch', 200)
        expect(ctx.api.dragging.value).toBe(false)
        expect(ctx.api.offset.value).toBe(0)
        expect(ctx.onDismiss).not.toHaveBeenCalled()
        expect(ctx.current.value).toBe(0)
    })

    it('ignores a fast drag that paused before the release', () => {
        const ctx = setup()
        wrapper = ctx.wrapper
        pointer('pointerdown', 100, ctx.surface)
        now = 10
        pointer('pointermove', 130, window)
        now = 160
        pointer('pointerup', 130, window)
        expect(ctx.onDismiss).not.toHaveBeenCalled()
        expect(ctx.current.value).toBe(0)
    })

    it('uses the release position as the final offset', () => {
        const ctx = setup()
        wrapper = ctx.wrapper
        pointer('pointerdown', 100, ctx.surface)
        now = 200
        pointer('pointermove', 130, window)
        now = 400
        pointer('pointerup', 300, window)
        expect(ctx.onDismiss).toHaveBeenCalledTimes(1)
    })

    it('stops listening after unmount', () => {
        const ctx = setup()
        pointer('pointerdown', 100, ctx.surface)
        ctx.wrapper.unmount()
        pointer('pointermove', 200, window)
        expect(ctx.api.dragging.value).toBe(false)
    })
})
