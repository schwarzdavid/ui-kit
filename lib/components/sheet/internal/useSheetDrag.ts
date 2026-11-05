import { onScopeDispose, readonly, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { resolveSheetRelease } from '@/components/sheet/internal/resolveSheetRelease'

const DRAG_THRESHOLD = 8
const VELOCITY_WINDOW = 100
const INTERACTIVE_SELECTOR = 'input, textarea, select, [contenteditable]'

interface DragSample {
    y: number
    time: number
}

export interface UseSheetDragOptions {
    surface: Readonly<Ref<HTMLElement | null>>
    body: Readonly<Ref<HTMLElement | null>>
    heights: () => number[]
    current: Ref<number>
    dismissible: Readonly<Ref<boolean>>
    onDismiss: () => void
}

export function useSheetDrag(options: UseSheetDragOptions) {
    const dragging = ref(false)
    const offset = ref(0)

    let pointerId: number | null = null
    let startX = 0
    let startY = 0
    let fromBody = false
    let samples: DragSample[] = []
    let touchDecision: boolean | null = null
    let swallowClick = false

    function sample(y: number) {
        const time = performance.now()
        samples = samples.filter(entry => time - entry.time <= VELOCITY_WINDOW)
        samples.push({ y, time })
    }

    function velocity() {
        const first = samples[0]
        const last = samples[samples.length - 1]
        if (first === last || last.time === first.time) {
            return 0
        }
        return (last.y - first.y) / (last.time - first.time)
    }

    function isHorizontal(dx: number, dy: number) {
        return Math.abs(dx) > Math.abs(dy)
    }

    function passedThreshold(dx: number, dy: number) {
        return Math.max(Math.abs(dx), Math.abs(dy)) >= DRAG_THRESHOLD
    }

    function detach() {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onCancel)
    }

    function reset() {
        if (pointerId !== null) {
            detach()
        }
        pointerId = null
        samples = []
        touchDecision = null
        dragging.value = false
        offset.value = 0
    }

    function onDown(event: PointerEvent) {
        if (pointerId !== null || event.button > 0) {
            return
        }
        swallowClick = false
        const target = event.target
        if (target instanceof Element && target.closest(INTERACTIVE_SELECTOR)) {
            return
        }
        fromBody = target instanceof Node && !!options.body.value?.contains(target)
        if (fromBody && event.pointerType !== 'touch' && event.pointerType !== 'pen') {
            return
        }
        pointerId = event.pointerId
        startX = event.clientX
        startY = event.clientY
        samples = []
        sample(event.clientY)
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
        window.addEventListener('pointercancel', onCancel)
    }

    function canStart(delta: number) {
        if (!fromBody) {
            return true
        }
        if (delta > 0) {
            return (options.body.value?.scrollTop ?? 0) === 0
        }
        return options.current.value < options.heights().length - 1
    }

    function onMove(event: PointerEvent) {
        if (event.pointerId !== pointerId) {
            return
        }
        const delta = event.clientY - startY
        if (!dragging.value) {
            const dx = event.clientX - startX
            if (!passedThreshold(dx, delta)) {
                return
            }
            if (isHorizontal(dx, delta) || !canStart(delta)) {
                reset()
                return
            }
            dragging.value = true
            const surface = options.surface.value
            if (surface && typeof surface.setPointerCapture === 'function') {
                surface.setPointerCapture(event.pointerId)
            }
        }
        offset.value = delta
        sample(event.clientY)
    }

    function onUp(event: PointerEvent) {
        if (event.pointerId !== pointerId) {
            return
        }
        if (!dragging.value) {
            reset()
            return
        }
        sample(event.clientY)
        const result = resolveSheetRelease({
            heights: options.heights(),
            current: options.current.value,
            delta: event.clientY - startY,
            velocity: velocity(),
            dismissible: options.dismissible.value,
        })
        reset()
        swallowClick = true
        if (result.type === 'dismiss') {
            options.onDismiss()
        } else {
            options.current.value = result.index
        }
    }

    function onCancel(event: PointerEvent) {
        if (event.pointerId !== pointerId) {
            return
        }
        reset()
    }

    function onTouchMove(event: TouchEvent) {
        if (pointerId === null) {
            return
        }
        if (!fromBody) {
            event.preventDefault()
            return
        }
        if (touchDecision === null) {
            const touch = event.touches[0]
            const dx = touch.clientX - startX
            const dy = touch.clientY - startY
            if (!passedThreshold(dx, dy)) {
                return
            }
            if (isHorizontal(dx, dy)) {
                reset()
                return
            }
            touchDecision = canStart(dy)
        }
        if (touchDecision) {
            event.preventDefault()
        }
    }

    function onTouchEnd() {
        touchDecision = null
    }

    function onClickCapture(event: MouseEvent) {
        if (!swallowClick) {
            return
        }
        swallowClick = false
        if (event.detail === 0) {
            return
        }
        event.preventDefault()
        event.stopPropagation()
    }

    watch(options.surface, (element, _previous, onCleanup) => {
        if (!element) {
            return
        }
        element.addEventListener('pointerdown', onDown)
        element.addEventListener('touchmove', onTouchMove, { passive: false })
        element.addEventListener('touchend', onTouchEnd)
        element.addEventListener('touchcancel', onTouchEnd)
        element.addEventListener('click', onClickCapture, true)
        onCleanup(() => {
            element.removeEventListener('pointerdown', onDown)
            element.removeEventListener('touchmove', onTouchMove)
            element.removeEventListener('touchend', onTouchEnd)
            element.removeEventListener('touchcancel', onTouchEnd)
            element.removeEventListener('click', onClickCapture, true)
            reset()
        })
    }, { immediate: true, flush: 'sync' })

    onScopeDispose(reset)

    return { dragging: readonly(dragging), offset: readonly(offset) }
}
