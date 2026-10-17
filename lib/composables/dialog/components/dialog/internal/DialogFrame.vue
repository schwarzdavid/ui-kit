<template>
    <VDialog
        :model-value="modelValue"
        :max-width="fullscreen ? undefined : maxWidth"
        :fullscreen="fullscreen"
        persistent
        no-click-animation
        :scrollable="false"
        retain-focus
        @keydown.esc.stop.prevent="onEscape"
        @after-enter="emit('opened')"
        @after-leave="emit('closed')">
        <VCard
            variant="flat"
            :border="false"
            :rounded="false"
            class="ui-dialog"
            :class="{ 'ui-dialog--fullscreen': fullscreen }">
            <component
                :is="form ? 'form' : 'div'"
                class="ui-dialog__layout"
                v-bind="form ? { novalidate: true } : {}"
                @submit.prevent="onSubmit">
                <header class="ui-dialog__header">
                    <VBtn
                        v-if="closable && fullscreen"
                        variant="text"
                        density="comfortable"
                        :icon="Icons.close"
                        :aria-label="closeLabel"
                        :disabled="persistent"
                        class="ui-dialog__close"
                        @click="emit('close')" />
                    <h2 class="ui-dialog__title">
                        <MaybeTranslation :content="title" :translate="translateTitle" />
                    </h2>
                    <slot name="header" />
                    <VBtn
                        v-if="closable && !fullscreen"
                        variant="text"
                        density="comfortable"
                        :icon="Icons.close"
                        :aria-label="closeLabel"
                        :disabled="persistent"
                        class="ui-dialog__close"
                        @click="emit('close')" />
                </header>
                <div class="ui-dialog__body">
                    <slot />
                </div>
                <footer v-if="slots.actions" class="ui-dialog__footer">
                    <slot name="actions" />
                </footer>
            </component>
        </VCard>
    </VDialog>
</template>

<script lang="ts" setup>
    import { computed, useSlots } from 'vue'
    import { VBtn, VCard, VDialog } from 'vuetify/components'
    import { useDisplay } from 'vuetify'
    import MaybeTranslation from '@/components/internal/MaybeTranslation.vue'
    import { useDialogCta } from '@/composables/dialog/internal/useDialogCta'
    import { useMaybeTranslation } from '@/composables/internal/useMaybeTranslation'
    import { resolveDialogWidth } from '@/composables/dialog/internal/dialogWidths'
    import type { DialogWidth } from '@/composables/dialog/types/DialogWidth'
    import { Icons } from '@/internal/icons'

    const props = withDefaults(defineProps<{
        modelValue: boolean
        title: string
        translateTitle?: boolean
        width?: DialogWidth
        closable?: boolean
        persistent?: boolean
        fullscreenOnMobile?: boolean
        form?: boolean
    }>(), {
        translateTitle: true,
        width: 'md',
        closable: true,
        persistent: false,
        fullscreenOnMobile: false,
        form: false,
    })

    const emit = defineEmits<{
        close: []
        submit: []
        opened: []
        closed: []
    }>()

    const slots = useSlots()
    const { xs } = useDisplay()
    const translate = useMaybeTranslation()
    const closeCta = useDialogCta(undefined, 'close')
    const closeLabel = computed(() => translate(closeCta.text, closeCta.translateText))
    const maxWidth = computed(() => resolveDialogWidth(props.width))
    const fullscreen = computed(() => props.fullscreenOnMobile && xs.value)

    function onEscape(): void {
        if (!props.persistent) {
            emit('close')
        }
    }

    function onSubmit(): void {
        if (props.form) {
            emit('submit')
        }
    }
</script>

<style lang="scss">
.ui-dialog {
    --ui-dialog-border: rgba(var(--v-border-color), var(--v-border-opacity));
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

.ui-dialog :is(.v-btn, a, input, textarea, select):focus-visible {
    outline: 2px solid rgb(var(--v-theme-focus, var(--v-theme-primary)));
    outline-offset: 2px;
}

.ui-dialog--fullscreen {
    max-height: none;
    height: 100%;
    border-radius: 0;
}

.ui-dialog--fullscreen .ui-dialog__header {
    align-items: center;
    min-height: 56px;
    padding: 8px;
    border-bottom: 1px solid var(--ui-dialog-border);
}

.ui-dialog--fullscreen .ui-dialog__title {
    margin: 0;
    font-size: 1rem;
    line-height: 1.5rem;
}

.ui-dialog--fullscreen .ui-dialog__body {
    padding: 16px;
}

.ui-dialog--fullscreen .ui-dialog__footer {
    padding: 12px 16px;
    border-top: 1px solid var(--ui-dialog-border);
}

.ui-dialog--fullscreen .ui-dialog__footer > .v-btn--variant-text {
    display: none;
}

.ui-dialog--fullscreen .ui-dialog__footer > .v-btn--variant-flat {
    flex: 1;
}
</style>
