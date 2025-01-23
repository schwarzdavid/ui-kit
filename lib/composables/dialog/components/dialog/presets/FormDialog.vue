<template>
    <VDialog v-model="dialogModel" @after-leave="resolveDialog">
        <VCard>
            <VToolbar>
                <VToolbarTitle>
                    <MaybeTranslation :content="data.title" :translate="!!data.translateTitle"/>
                </VToolbarTitle>
                <VSpacer/>
                <VBtn icon="mdi-close" @click="closeDialog"/>
            </VToolbar>
            <component :is="data.component" ref="formComponent" @save="finish" v-bind="createComponentProps()"/>
            <VDivider/>
            <VCardActions>
                <VSpacer/>
                <VBtn>Hi</VBtn>
                <VBtn @click="finish">Test</VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>
<script setup lang="ts" generic="R, T = R, C extends FormDialogComponent<T> = FormDialogComponent<T>">
    import { VBtn, VCard, VCardActions, VDialog, VDivider, VSpacer, VToolbar, VToolbarTitle } from 'vuetify/components'
    import MaybeTranslation from '@/components/internal/MaybeTranslation.vue'
    import type { FormDialogComponent, FormDialogProps } from '@/composables/dialog/presets/FormDialogProps'
    import { ref, useTemplateRef } from 'vue'
    import type { DialogComponentEmits } from '@/composables/dialog/types/DialogComponent'
    import useVuelidate from '@vuelidate/core'
    import { useLoading } from '@/composables/loading/useLoading'
    import type { ComponentProps } from 'vue-component-type-helpers'

    const props = defineProps<{ data: FormDialogProps<R, T, C> }>()
    const emit = defineEmits<DialogComponentEmits<R | null>>()

    const formComponent = useTemplateRef<InstanceType<FormDialogComponent<T>>>('formComponent')
    const dialogModel = ref(true)
    const v = useVuelidate()
    const { loading, action } = useLoading(performAction)

    function createComponentProps(): ComponentProps<C> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (props.data as any).props ?? {}
    }

    async function finish() {
        if (!await v.value.$validate()) {
            return
        }
        await action()
    }

    async function performAction() {
        const result = await formComponent.value?.finish()
        if (!result) {
            console.warn('FormDialog: No result returned from form component.')
            return
        }
        if (typeof props.data.action === 'function') {
            const emitValue = await props.data.action(result)
            emit('resolve', emitValue)
        } else {
            emit('resolve', result as R)
        }
    }

    function closeDialog(): void {
        dialogModel.value = false
    }

    function resolveDialog() {
        emit('resolve', null)
    }
</script>
