<template>
    <VBottomSheet
        :model-value="modelValue"
        persistent
        no-click-animation
        :scrollable="false"
        retain-focus
        content-class="ui-sheet-overlay"
        @click:outside="onOverlayClick"
        @keydown.esc.stop.prevent="onEscape"
        @after-enter="emit('opened')"
        @after-leave="onAfterLeave">
        <div
            ref="surface"
            class="ui-sheet"
            :class="[`ui-sheet--${currentStage}`, { 'ui-sheet--dragging': dragging, 'ui-sheet--dismissing': !!dismissedFrame }]"
            :style="sheetStyle">
            <component
                :is="form ? 'form' : 'div'"
                class="ui-sheet__layout"
                v-bind="form ? { novalidate: true } : {}"
                @submit.prevent="onSubmit">
                <button
                    v-if="stages.length > 1"
                    type="button"
                    class="ui-sheet__handle"
                    :aria-label="handleLabel"
                    @click="toggle">
                    <span class="ui-sheet__grip" />
                </button>
                <div v-else class="ui-sheet__handle" aria-hidden="true">
                    <span class="ui-sheet__grip" />
                </div>
                <header class="ui-sheet__header">
                    <h2 v-if="title" class="ui-sheet__title">
                        <MaybeTranslation :content="title" :translate="translateTitle" />
                    </h2>
                    <slot name="header" />
                    <VBtn
                        v-if="closable && currentStage === 'fullscreen'"
                        variant="text"
                        density="comfortable"
                        :icon="Icons.close"
                        :aria-label="closeLabel"
                        :disabled="persistent"
                        class="ui-sheet__close"
                        @click="requestClose" />
                </header>
                <div ref="body" class="ui-sheet__body">
                    <div v-if="hasPreview" v-show="currentStage === 'preview'" ref="preview" class="ui-sheet__preview">
                        <slot name="preview" />
                    </div>
                    <div v-show="currentStage !== 'preview'" ref="content" class="ui-sheet__content">
                        <slot />
                    </div>
                </div>
                <footer v-if="slots.actions" class="ui-sheet__footer">
                    <slot name="actions" />
                </footer>
            </component>
        </div>
    </VBottomSheet>
</template>

<script lang="ts" setup>
    import { computed, onBeforeUnmount, onBeforeUpdate, onMounted, ref, useSlots, useTemplateRef, watch } from 'vue'
    import type { StyleValue } from 'vue'
    import { VBottomSheet, VBtn } from 'vuetify/components'
    import MaybeTranslation from '@/components/internal/MaybeTranslation.vue'
    import { resolveSheetStages } from '@/components/sheet/internal/resolveSheetStages'
    import { useSheetDrag } from '@/components/sheet/internal/useSheetDrag'
    import type { SheetStage } from '@/components/sheet/types/SheetStage'
    import { useMaybeTranslation } from '@/composables/internal/useMaybeTranslation'
    import { Icons } from '@/internal/icons'
    import { usePluginContext } from '@/plugin/composables/usePluginContext'

    const CONTENT_RATIO = 0.9
    const RUBBER_BAND = 0.2

    const props = withDefaults(defineProps<{
        modelValue: boolean
        stage?: SheetStage
        title?: string
        translateTitle?: boolean
        expandable?: boolean
        closable?: boolean
        persistent?: boolean
        form?: boolean
    }>(), {
        stage: undefined,
        title: undefined,
        translateTitle: true,
        expandable: true,
        closable: true,
        persistent: false,
        form: false,
    })

    const emit = defineEmits<{
        'update:modelValue': [value: boolean]
        'update:stage': [stage: SheetStage]
        'close': []
        'submit': []
        'opened': []
        'closed': []
    }>()

    defineSlots<{
        default?: () => unknown
        preview?: () => unknown
        header?: () => unknown
        actions?: () => unknown
    }>()

    const slots = useSlots()
    const { options } = usePluginContext()
    const translate = useMaybeTranslation()

    const surface = useTemplateRef<HTMLElement>('surface')
    const body = useTemplateRef<HTMLElement>('body')
    const previewElement = useTemplateRef<HTMLElement>('preview')
    const contentElement = useTemplateRef<HTMLElement>('content')

    const hasPreview = ref(!!slots.preview)

    onBeforeUpdate(() => {
        hasPreview.value = !!slots.preview
    })

    const stages = computed(() => resolveSheetStages(hasPreview.value, props.expandable))
    const selected = ref<SheetStage>(initialStage())
    const currentStage = computed<SheetStage>(() => stages.value.includes(selected.value) ? selected.value : stages.value[0])
    const current = computed({
        get: () => stages.value.indexOf(currentStage.value),
        set: (index: number) => {
            selected.value = stages.value[index]
        },
    })
    const atTop = computed(() => current.value >= stages.value.length - 1)

    function initialStage(): SheetStage {
        return props.stage && stages.value.includes(props.stage) ? props.stage : stages.value[0]
    }

    const messages = computed(() => options.i18n.messages)
    const handleLabel = computed(() => translate(atTop.value ? messages.value.collapse : messages.value.expand))
    const closeLabel = computed(() => translate(messages.value.close))

    const natural = ref({ chrome: 0, preview: 0, content: 0 })
    const viewport = ref(0)

    function verticalPadding(element: HTMLElement): number {
        const style = getComputedStyle(element)
        return (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0)
    }

    function sectionHeight(element: HTMLElement | null): number {
        if (!element) {
            return 0
        }
        if (element.style.display !== 'none') {
            return element.offsetHeight
        }
        element.style.display = ''
        const height = element.offsetHeight
        element.style.display = 'none'
        return height
    }

    function measure(): void {
        const root = surface.value
        const scroller = body.value
        viewport.value = window.innerHeight
        if (!root || !scroller) {
            return
        }
        natural.value = {
            chrome: root.offsetHeight - scroller.offsetHeight + verticalPadding(scroller),
            preview: sectionHeight(previewElement.value),
            content: sectionHeight(contentElement.value),
        }
    }

    function stageHeight(value: SheetStage): number {
        const { chrome, preview, content } = natural.value
        if (value === 'fullscreen') {
            return viewport.value
        }
        if (value === 'preview') {
            return chrome + preview
        }
        return Math.min(chrome + content, CONTENT_RATIO * viewport.value)
    }

    function heights(): number[] {
        measure()
        return stages.value.map(stageHeight)
    }

    interface DragFrame {
        height: number
        offset: number
    }

    let lastFrame: DragFrame | null = null
    const dismissed = ref<DragFrame | null>(null)

    const dismissedFrame = computed(() => props.modelValue ? null : dismissed.value)

    function close(frame: DragFrame | null): void {
        dismissed.value = frame
        emit('update:modelValue', false)
        emit('close')
    }

    function requestClose(): void {
        close(null)
    }

    function onDismiss(): void {
        close(lastFrame)
    }

    const { dragging, offset } = useSheetDrag({
        surface,
        body,
        heights,
        current,
        dismissible: computed(() => !props.persistent),
        onDismiss,
    })

    const dragHeights = ref<number[]>([])

    watch(dragging, (value) => {
        dragHeights.value = value ? heights() : []
        if (value) {
            lastFrame = null
            dismissed.value = null
        }
    }, { flush: 'sync' })

    watch(offset, (value) => {
        if (dragging.value && dragHeights.value.length) {
            lastFrame = { height: dragHeights.value[current.value], offset: Math.max(value, 0) }
        }
    }, { flush: 'sync' })

    const sheetStyle = computed<StyleValue>(() => {
        if (dismissedFrame.value) {
            const { height, offset: shift } = dismissedFrame.value
            return { height: `${String(height)}px`, transform: `translateY(${String(shift)}px)` }
        }
        if (dragging.value && dragHeights.value.length) {
            const base = dragHeights.value[current.value]
            if (offset.value >= 0) {
                return { height: `${String(base)}px`, transform: `translateY(${String(offset.value)}px)` }
            }
            const top = dragHeights.value[dragHeights.value.length - 1]
            const target = base - offset.value
            const height = Math.min(target, top) + Math.max(target - top, 0) * RUBBER_BAND
            return { height: `${String(height)}px` }
        }
        const { chrome, preview, content } = natural.value
        if (currentStage.value === 'preview' && chrome + preview > 0) {
            return { height: `${String(chrome + preview)}px` }
        }
        if (currentStage.value === 'content' && chrome + content > 0) {
            return { height: `min(${String(chrome + content)}px, 90dvh)` }
        }
        return {}
    })

    let observer: ResizeObserver | null = null

    function observe(): void {
        observer?.disconnect()
        observer = null
        const targets = [previewElement.value, contentElement.value].filter((element): element is HTMLElement => !!element)
        if (!targets.length || typeof ResizeObserver === 'undefined') {
            return
        }
        observer = new ResizeObserver(() => {
            if (!dragging.value) {
                measure()
            }
        })
        targets.forEach((element) => {
            observer?.observe(element)
        })
    }

    watch([previewElement, contentElement], observe, { flush: 'post' })

    onMounted(() => {
        viewport.value = window.innerHeight
        window.addEventListener('resize', measure)
    })

    onBeforeUnmount(() => {
        observer?.disconnect()
        window.removeEventListener('resize', measure)
    })

    function syncStage(): void {
        if (currentStage.value !== props.stage) {
            emit('update:stage', currentStage.value)
        }
    }

    watch(() => props.stage, (value) => {
        if (value && stages.value.includes(value)) {
            selected.value = value
        } else {
            syncStage()
        }
    })

    watch(stages, (value) => {
        if (!value.includes(selected.value)) {
            selected.value = value[0]
        }
    })

    watch(() => props.modelValue, (open) => {
        if (open) {
            dismissed.value = null
            selected.value = initialStage()
        }
    })

    watch(currentStage, syncStage, { immediate: true })
    watch(currentStage, measure, { flush: 'post' })

    function toggle(): void {
        current.value = atTop.value ? 0 : stages.value.length - 1
    }

    function onAfterLeave(): void {
        dismissed.value = null
        emit('closed')
    }

    function onEscape(): void {
        if (!props.persistent) {
            requestClose()
        }
    }

    function onOverlayClick(): void {
        if (options.dialog.closeOnOverlayClick && !props.persistent) {
            requestClose()
        }
    }

    function onSubmit(): void {
        if (props.form) {
            emit('submit')
        }
    }
</script>

<style lang="scss">
.v-bottom-sheet > .v-bottom-sheet__content.v-overlay__content.ui-sheet-overlay {
    max-height: 100%;
    margin: 0;
    box-shadow: none;
}

.ui-sheet {
    --ui-sheet-border: rgba(var(--v-border-color), var(--v-border-opacity));
    --ui-sheet-motion: 250ms cubic-bezier(0.2, 0, 0, 1);
    display: flex;
    flex-direction: column;
    max-height: 100dvh;
    border-radius: 16px 16px 0 0;
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-ink, var(--v-theme-on-surface)));
    box-shadow: var(--v-shadow-lg, 0 -4px 8px rgba(29, 27, 22, 0.08), 0 -16px 48px rgba(29, 27, 22, 0.18));
    overflow: hidden;
    transition: height var(--ui-sheet-motion), transform var(--ui-sheet-motion), border-radius var(--ui-sheet-motion);
}

.ui-sheet--content {
    max-height: 90dvh;
}

.ui-sheet--fullscreen {
    height: 100dvh;
    border-radius: 0;
}

.ui-sheet--dragging,
.ui-sheet--dismissing {
    max-height: none;
    user-select: none;
    transition: none;
}

.ui-sheet__layout {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
}

.ui-sheet__handle {
    display: flex;
    justify-content: center;
    flex: none;
    width: 100%;
    padding: 10px 0 6px;
    border: 0;
    background: none;
    color: inherit;
    cursor: grab;
    touch-action: none;
}

.ui-sheet__handle:focus-visible {
    outline: none;
}

.ui-sheet__handle:focus-visible .ui-sheet__grip {
    box-shadow: 0 0 0 2px rgb(var(--v-theme-primary));
}

.ui-sheet--dragging .ui-sheet__handle {
    cursor: grabbing;
}

.ui-sheet__grip {
    width: 32px;
    height: 4px;
    border-radius: 2px;
    background: rgb(var(--v-theme-ink-3, var(--v-theme-on-surface)));
    opacity: 0.4;
}

.ui-sheet__header {
    display: flex;
    align-items: center;
    flex: none;
    gap: 12px;
    min-height: 40px;
    padding: 0 16px 0 24px;
    touch-action: none;
}

.ui-sheet--fullscreen .ui-sheet__header {
    border-bottom: 1px solid var(--ui-sheet-border);
    padding-bottom: 8px;
}

.ui-sheet__title {
    flex: 1;
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.75rem;
    overflow-wrap: anywhere;
}

.ui-sheet__body {
    flex: 1 1 auto;
    min-height: 0;
    padding: 16px 24px 8px;
    overflow-y: auto;
    overscroll-behavior: contain;
    font-size: 0.875rem;
    line-height: 1.25rem;
}

.ui-sheet__preview,
.ui-sheet__content {
    display: grid;
    align-content: start;
    gap: 20px;
}

.ui-sheet__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex: none;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 24px calc(16px + env(safe-area-inset-bottom));
    border-top: 1px solid var(--ui-sheet-border);
}

@media (prefers-reduced-motion: reduce) {
    .ui-sheet {
        transition: none;
    }
}
</style>
