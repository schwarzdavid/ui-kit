<template>
    <DialogFrame
        :model-value="open"
        :title="data.title"
        :translate-title="data.translateTitle"
        :width="data.width ?? 'sm'"
        @close="closeWithDefault"
        @closed="settle">
        <p v-if="'content' in data" class="ui-dialog__text">
            <MaybeTranslation :content="data.content" :translate="data.translateContent" />
        </p>
        <component :is="data.component" v-else v-bind="componentProps" />
        <template v-if="hasActions" #actions>
            <VBtn
                v-for="(cta, index) in additionalCta"
                :key="index"
                variant="text"
                @click="() => onCtaClick(cta)">
                <MaybeTranslation :content="cta.text" :translate="cta.translateText" />
            </VBtn>
            <VBtn v-if="defaultCta" variant="flat" color="primary" @click="closeWithDefault">
                <MaybeTranslation :content="defaultCta.text" :translate="defaultCta.translateText" />
            </VBtn>
        </template>
    </DialogFrame>
</template>

<script lang="ts" setup generic="T">
    import { computed, ref } from 'vue'
    import { VBtn } from 'vuetify/components'
    import DialogFrame from '@/composables/dialog/components/dialog/internal/DialogFrame.vue'
    import MaybeTranslation from '@/components/internal/MaybeTranslation.vue'
    import type { InfoDialogProps } from '@/composables/dialog/presets/InfoDialogProps'
    import type { InteractiveDialogCta } from '@/composables/dialog/types/DialogCta'
    import { useDialogCta } from '@/composables/dialog/internal/useDialogCta'
    import { useDialogEntry } from '@/composables/dialog/useDialogEntry'

    const { data, resolve } = useDialogEntry<InfoDialogProps<T>>()

    const defaultCta = data.defaultCta === false ? null : useDialogCta(data.defaultCta, 'close')
    const additionalCta = computed(() => data.additionalCta ?? [])
    const hasActions = computed(() => defaultCta !== null || additionalCta.value.length > 0)
    const open = ref(true)
    const componentProps = computed(() => ('props' in data ? data.props : {}) as Record<string, unknown>)

    let resolveValue: T | null = null

    function onCtaClick(cta: InteractiveDialogCta<T | null>): void {
        if ('action' in cta) {
            cta.action()
            return
        }
        closeDialog(cta.value)
    }

    function closeDialog(value: T | null): void {
        if (!open.value) {
            return
        }
        resolveValue = value
        open.value = false
    }

    function closeWithDefault(): void {
        closeDialog(null)
    }

    function settle(): void {
        resolve(resolveValue)
    }
</script>
