<template>
    <VDialog v-model="dialogModel" :max-width="data.width ?? DEFAULT_MAX_WIDTH" @after-leave="resolveDialog">
        <VCard class="info-dialog-card">
            <div class="d-flex justify-space-between pr-2 py-2">
                <VCardTitle>
                    <MaybeTranslation :translate="data.translateTitle" :content="data.title" />
                </VCardTitle>
                <!-- eslint-disable-next-line vue/v-on-handler-style -->
                <VBtn icon="$close" variant="text" @click="closeDialog(null)" />
            </div>

            <VCardText v-if="textContent">
                <p>
                    <MaybeTranslation :translate="textContent.translateContent" :content="textContent.content" />
                </p>
            </VCardText>

            <component :is="componentContent.component" v-if="componentContent" v-bind="componentContent.props" />

            <VCardActions class="justify-end">
                <VBtn
                    v-for="(cta, index) in data.additionalCta ?? []"
                    :key="index"
                    color="primary"
                    variant="text"
                    @click="() => onCtaClick(cta)">
                    <MaybeTranslation :translate="cta.translateText" :content="cta.text" />
                </VBtn>
                <VBtn v-if="defaultCta" color="primary" variant="elevated" @click="closeDialog">
                    <MaybeTranslation :translate="defaultCta.translateText" :content="defaultCta.text" />
                </VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<script lang="ts" setup generic="T">
    import { computed, ref } from 'vue'
    import { VBtn, VCard, VCardActions, VCardText, VCardTitle, VDialog } from 'vuetify/components'
    import { merge } from 'lodash'
    import MaybeTranslation from '../../../../../components/internal/MaybeTranslation.vue'
    import type {
        InfoDialogActionCta,
        InfoDialogComponentContent,
        InfoDialogCta,
        InfoDialogProps,
        InfoDialogTextContent,
        InfoDialogValueCta,
    } from '../../../presets/InfoDialogProps'
    import type { DialogComponentEmits } from '../../../types/DialogComponent'

    const props = defineProps<{ data: InfoDialogProps<T> }>()
    const emit = defineEmits<DialogComponentEmits<T | null>>()

    const DEFAULT_MAX_WIDTH = 650
    const DEFAULT_CTA: InfoDialogValueCta<null> = {
        text: 'APP.CLOSE',
        translateText: true,
        value: null,
    }

    let resolveValue: T | null = null

    const dialogModel = ref(true)
    const textContent = computed<Pick<InfoDialogTextContent<T>, 'content' | 'translateContent'> | null>(() => Object.hasOwn(props.data, 'content')
        ? {
            content: (props.data as InfoDialogTextContent<T>).content,
            translateContent: (props.data as InfoDialogTextContent<T>).translateContent,
        }
        : null)
    const componentContent = computed<Pick<InfoDialogComponentContent, 'component' | 'props'> | null>(() => Object.hasOwn(props.data, 'component')
        ? {
            component: (props.data as InfoDialogComponentContent).component,
            props: (props.data as InfoDialogComponentContent).props,
        }
        : null)

    const defaultCta = computed<InfoDialogValueCta<null> | null>(() => props.data.defaultCta === false
        ? null
        : merge({}, DEFAULT_CTA, props.data.defaultCta))

    function onCtaClick(cta: InfoDialogCta<T | null>): void {
        if (isActionCta(cta)) {
            cta.action()
        }
        else {
            closeDialog(cta.value)
        }
    }

    function isActionCta(cta: InfoDialogCta<unknown>): cta is InfoDialogActionCta {
        return Object.hasOwn(cta, 'action')
    }

    function closeDialog(value: T | null = null): void {
        resolveValue = value
        dialogModel.value = false
    }

    function resolveDialog(): void {
        emit('resolve', resolveValue)
    }
</script>

<style lang="scss" scoped>
@use "../../../../../../node_modules/vuetify/settings";

.info-dialog-card {
    > :deep(.v-card-text) {
        padding-left: settings.$spacer * 4 !important;
        padding-right: settings.$spacer * 4 !important;
    }
}
</style>
