<template>
    <DialogFrame
        :model-value="open"
        :title="data.title"
        :translate-title="data.translateTitle"
        :width="data.width ?? 'sm'"
        :closable="false"
        :persistent="!!data.permanent"
        @close="rejectDialog"
        @opened="focusInitial"
        @closed="settle">
        <p v-if="'content' in data" class="ui-dialog__text">
            <MaybeTranslation :content="data.content" :translate="data.translateContent" />
        </p>
        <component :is="data.component" v-else v-bind="componentProps" />
        <template #actions>
            <VBtn
                v-for="button in buttons"
                :key="button.key"
                :ref="element => setButton(button.key, element)"
                :variant="button.variant"
                :color="button.color"
                @click="button.onClick">
                <MaybeTranslation :content="button.cta.text" :translate="button.cta.translateText" />
            </VBtn>
        </template>
    </DialogFrame>
</template>

<script lang="ts" setup>
    import { type ComponentPublicInstance, computed, ref } from 'vue'
    import { VBtn } from 'vuetify/components'
    import DialogFrame from '@/composables/dialog/components/dialog/internal/DialogFrame.vue'
    import MaybeTranslation from '@/components/internal/MaybeTranslation.vue'
    import { ConfirmDialogLevel, type ConfirmDialogProps } from '@/composables/dialog/presets/ConfirmDialogProps'
    import type { DialogCta } from '@/composables/dialog/types/DialogCta'
    import { useDialogCta } from '@/composables/dialog/internal/useDialogCta'
    import { useDialogEntry } from '@/composables/dialog/useDialogEntry'

    type ButtonKey = 'reject' | 'confirm'

    interface ButtonDescriptor {
        key: ButtonKey
        cta: DialogCta
        variant: 'flat' | 'text'
        color: string | undefined
        onClick: () => void
    }

    const { data, resolve, reject } = useDialogEntry<ConfirmDialogProps, boolean>()

    const confirmCta = useDialogCta(data.confirmCta, 'yes')
    const rejectCta = useDialogCta(data.rejectCta, 'no')
    const open = ref(true)
    const buttonElements: Record<ButtonKey, HTMLElement | null> = { reject: null, confirm: null }
    const highlightCta = computed(() => data.highlightCta ?? 'confirm')
    const ctaColor = computed(() => data.level ?? 'primary')
    const componentProps = computed(() => ('props' in data ? data.props : {}) as Record<string, unknown>)

    const buttons = computed(() => {
        const highlighted = highlightCta.value
        const descriptors: ButtonDescriptor[] = [
            {
                key: 'reject',
                cta: rejectCta,
                variant: highlighted === 'reject' ? 'flat' : 'text',
                color: highlighted === 'reject' ? ctaColor.value : undefined,
                onClick: rejectDialog,
            },
            {
                key: 'confirm',
                cta: confirmCta,
                variant: highlighted === 'confirm' ? 'flat' : 'text',
                color: highlighted === 'confirm' ? ctaColor.value : undefined,
                onClick: confirmDialog,
            },
        ]
        return highlighted === 'reject' ? descriptors.reverse() : descriptors
    })

    let confirmed = false

    function setButton(key: ButtonKey, element: Element | ComponentPublicInstance | null): void {
        if (element && '$el' in element) {
            buttonElements[key] = element.$el as HTMLElement
        } else {
            buttonElements[key] = null
        }
    }

    function rejectDialog(): void {
        if (!open.value) {
            return
        }
        confirmed = false
        open.value = false
    }

    function confirmDialog(): void {
        if (!open.value) {
            return
        }
        confirmed = true
        open.value = false
    }

    function focusInitial(): void {
        buttonElements[data.level === ConfirmDialogLevel.DANGER ? 'reject' : 'confirm']?.focus()
    }

    function settle(): void {
        if (!confirmed && data.throwOnReject) {
            reject()
            return
        }
        resolve(confirmed)
    }
</script>
