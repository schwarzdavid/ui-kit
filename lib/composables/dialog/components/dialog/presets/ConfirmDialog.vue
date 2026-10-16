<template>
    <VDialog
        v-model="dialogModel"
        :persistent="!!data.permanent"
        :max-width="data.maxWidth ?? DEFAULT_MAX_WIDTH"
        @after-leave="resolveDialog">
        <VCard class="confirm-dialog-card">
            <div class="d-flex justify-space-between pr-2 py-2">
                <VCardTitle>
                    <MaybeTranslation :translate="data.translateTitle" :content="data.title" />
                </VCardTitle>
                <VBtn v-if="!data.permanent" icon="$close" variant="text" :aria-label="closeLabel" @click="closeDialog" />
            </div>

            <VCardText v-if="textContent">
                <MaybeTranslation :translate="textContent.translateContent" :content="textContent.content" />
            </VCardText>

            <component :is="componentContent.component" v-if="componentContent" v-bind="componentContent.props" />

            <VCardActions class="justify-end">
                <div class="d-flex align-center" :class="highlightCta === 'confirm' ? '' : 'flex-row-reverse'">
                    <VBtn
                        :variant="highlightCta === 'reject' ? 'elevated' : 'text'"
                        :color="ctaColor"
                        @click="closeDialog">
                        <MaybeTranslation :translate="rejectCta.translateText" :content="rejectCta.text" />
                    </VBtn>
                    <VBtn
                        :variant="highlightCta === 'confirm' ? 'elevated' : 'text'"
                        :color="ctaColor"
                        @click="finishDialog">
                        <MaybeTranslation :translate="confirmCta.translateText" :content="confirmCta.text" />
                    </VBtn>
                </div>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<script lang="ts" setup>
    import { VBtn, VCard, VCardActions, VCardText, VCardTitle, VDialog } from 'vuetify/components'
    import { computed, ref } from 'vue'
    import MaybeTranslation from '@/components/internal/MaybeTranslation.vue'
    import type { DialogComponentEmits } from '@/composables/dialog/types/DialogComponent'
    import type {
        ConfirmDialogComponentContent,
        ConfirmDialogProps,
        ConfirmDialogTextContent,
    } from '@/composables/dialog/presets/ConfirmDialogProps'
    import { useDialogCta } from '@/composables/dialog/internal/useDialogCta'
    import { useMaybeTranslation } from '@/composables/internal/useMaybeTranslation'

    const props = defineProps<{ data: ConfirmDialogProps }>()
    const emit = defineEmits<DialogComponentEmits<boolean>>()

    const DEFAULT_MAX_WIDTH = 550

    const confirmCta = useDialogCta(props.data.confirmCta, 'yes')
    const rejectCta = useDialogCta(props.data.rejectCta, 'no')
    const translate = useMaybeTranslation()
    const closeCta = useDialogCta(undefined, 'close')
    const closeLabel = computed(() => translate(closeCta.text, closeCta.translateText))

    let resolveValue = false

    const dialogModel = ref(true)
    const textContent = computed<Pick<ConfirmDialogTextContent, 'content' | 'translateContent'> | null>(() => Object.hasOwn(props.data, 'content')
        ? {
            content: (props.data as ConfirmDialogTextContent).content,
            translateContent: (props.data as ConfirmDialogTextContent).translateContent,
        }
        : null)
    const componentContent = computed<Pick<ConfirmDialogComponentContent, 'component' | 'props'> | null>(() => Object.hasOwn(props.data, 'component')
        ? {
            component: (props.data as ConfirmDialogComponentContent).component,
            props: (props.data as ConfirmDialogComponentContent).props,
        }
        : null)
    const highlightCta = computed<ConfirmDialogProps['highlightCta']>(() => props.data.highlightCta ?? 'confirm')
    const ctaColor = computed<string>(() => props.data.level ?? 'primary')

    function closeDialog(): void {
        dialogModel.value = false
    }

    function finishDialog(): void {
        resolveValue = true
        dialogModel.value = false
    }

    function resolveDialog(): void {
        if (props.data.throwOnReject && !resolveValue) {
            emit('reject')
            return
        }
        emit('resolve', resolveValue)
    }
</script>

<style lang="scss" scoped>
@use "vuetify/settings";

.confirm-dialog-card {
    > :deep(.v-card-text) {
        padding-left: settings.$spacer * 4 !important;
        padding-right: settings.$spacer * 4 !important;
    }
}
</style>
