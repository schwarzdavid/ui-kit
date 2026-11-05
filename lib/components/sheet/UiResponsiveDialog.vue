<template>
    <UiBottomSheet
        v-if="mobile"
        v-bind="attrs"
        :model-value="modelValue"
        :stage="stage"
        :title="title"
        :translate-title="translateTitle"
        :expandable="expandable"
        :closable="closable"
        :persistent="persistent"
        :form="form"
        @update:model-value="value => emit('update:modelValue', value)"
        @update:stage="value => emit('update:stage', value)"
        @close="emit('close')"
        @submit="emit('submit')"
        @opened="emit('opened')"
        @closed="onClosed">
        <template v-if="slots.preview" #preview>
            <slot name="preview" />
        </template>
        <template v-if="slots.header" #header>
            <slot name="header" />
        </template>
        <div :ref="setBodyTarget" class="ui-responsive-dialog__slot" />
        <template v-if="slots.actions" #actions>
            <slot name="actions" />
        </template>
    </UiBottomSheet>
    <VDialog
        v-else
        v-bind="attrs"
        :model-value="modelValue"
        :max-width="maxWidth"
        persistent
        no-click-animation
        :scrollable="false"
        retain-focus
        @click:outside="onOverlayClick"
        @keydown.esc.stop.prevent="onEscape"
        @after-enter="emit('opened')"
        @after-leave="onClosed">
        <VCard
            variant="flat"
            :border="false"
            :rounded="false"
            class="ui-dialog">
            <component
                :is="form ? 'form' : 'div'"
                class="ui-dialog__layout"
                v-bind="form ? { novalidate: true } : {}"
                @submit.prevent="onSubmit">
                <header class="ui-dialog__header">
                    <h2 class="ui-dialog__title">
                        <MaybeTranslation :content="title" :translate="translateTitle" />
                    </h2>
                    <slot name="header" />
                    <VBtn
                        v-if="closable"
                        variant="text"
                        density="comfortable"
                        :icon="Icons.close"
                        :aria-label="closeLabel"
                        :disabled="persistent"
                        class="ui-dialog__close"
                        @click="requestClose" />
                </header>
                <div class="ui-dialog__body">
                    <div :ref="setBodyTarget" class="ui-responsive-dialog__slot" />
                </div>
                <footer v-if="slots.actions" class="ui-dialog__footer">
                    <slot name="actions" />
                </footer>
            </component>
        </VCard>
    </VDialog>
    <Teleport v-if="bodyTarget" :to="bodyTarget">
        <slot />
    </Teleport>
</template>

<script lang="ts" setup>
    import { computed, shallowRef, useAttrs, useSlots, watch } from 'vue'
    import type { ComponentPublicInstance } from 'vue'
    import { VBtn, VCard, VDialog } from 'vuetify/components'
    import { useDisplay } from 'vuetify'
    import MaybeTranslation from '@/components/internal/MaybeTranslation.vue'
    import UiBottomSheet from '@/components/sheet/UiBottomSheet.vue'
    import type { SheetStage } from '@/components/sheet/types/SheetStage'
    import { useDialogCta } from '@/composables/dialog/internal/useDialogCta'
    import { useMaybeTranslation } from '@/composables/internal/useMaybeTranslation'
    import { resolveDialogWidth } from '@/composables/dialog/internal/dialogWidths'
    import type { DialogWidth } from '@/composables/dialog/types/DialogWidth'
    import { Icons } from '@/internal/icons'
    import { usePluginContext } from '@/plugin/composables/usePluginContext'

    defineOptions({ inheritAttrs: false })

    const props = withDefaults(defineProps<{
        modelValue: boolean
        title: string
        translateTitle?: boolean
        width?: DialogWidth
        closable?: boolean
        persistent?: boolean
        form?: boolean
        expandable?: boolean
        stage?: SheetStage
    }>(), {
        translateTitle: true,
        width: 'md',
        closable: true,
        persistent: false,
        form: false,
        expandable: true,
        stage: undefined,
    })

    const emit = defineEmits<{
        'update:modelValue': [value: boolean]
        'close': []
        'submit': []
        'opened': []
        'closed': []
        'update:stage': [stage: SheetStage]
    }>()

    defineSlots<{
        default?: () => unknown
        preview?: () => unknown
        header?: () => unknown
        actions?: () => unknown
    }>()

    const slots = useSlots()
    const attrs = useAttrs()
    const { options } = usePluginContext()
    const { mobile } = useDisplay()
    const translate = useMaybeTranslation()
    const closeCta = useDialogCta(undefined, 'close')
    const closeLabel = computed(() => translate(closeCta.text, closeCta.translateText))
    const maxWidth = computed(() => resolveDialogWidth(props.width))
    const bodyTarget = shallowRef<HTMLElement | null>(null)

    let leaving = false

    function setBodyTarget(element: Element | ComponentPublicInstance | null): void {
        if (element instanceof HTMLElement) {
            bodyTarget.value = element
        }
    }

    watch(() => props.modelValue, (open, wasOpen) => {
        leaving = !open && wasOpen
    })

    watch(mobile, () => {
        if (leaving && !props.modelValue) {
            onClosed()
        }
    })

    function onClosed(): void {
        leaving = false
        if (!props.modelValue) {
            bodyTarget.value = null
        }
        emit('closed')
    }

    function requestClose(): void {
        emit('update:modelValue', false)
        emit('close')
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
.ui-responsive-dialog__slot {
    display: contents;
}

.ui-dialog {
    display: flex;
    flex-direction: column;
    max-height: calc(100dvh - 48px);
    border-radius: 10px;
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-ink, var(--v-theme-on-surface)));
    box-shadow: var(--v-shadow-lg, 0 4px 8px rgba(29, 27, 22, 0.08), 0 24px 48px rgba(29, 27, 22, 0.18));
    overflow: hidden;
}

.ui-dialog__layout {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
}

.ui-dialog__header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 20px 16px 0 24px;
}

.ui-dialog__title {
    flex: 1;
    margin: 4px 0 0;
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.75rem;
    overflow-wrap: anywhere;
}

.ui-dialog__body {
    display: grid;
    align-content: start;
    gap: 20px;
    flex: 1 1 auto;
    min-height: 0;
    padding: 16px 24px 8px;
    overflow-y: auto;
    font-size: 0.875rem;
    line-height: 1.25rem;
}

.ui-dialog__text {
    margin: 0;
}

.ui-dialog__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding: 16px 24px 20px;
}
</style>
