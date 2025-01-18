<template>
    <VDialog v-model="dialogModel" @after-leave="resolveDialog">
        <VCard>
            <VToolbar>
                <VToolbarTitle>
                    <MaybeTranslation :content="data.title" :translate="!!data.translateTitle"/>
                </VToolbarTitle>
                <VSpacer/>
                <VBtn icon="mdi-close" @click="closeDialog" />
            </VToolbar>
            <component :is="data.component" ref="formComponent" v-model:loading="loading"/>
            <VDivider/>
            <VCardActions>
                <VSpacer/>
                <VBtn>Hi</VBtn>
                <VBtn>Test</VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>
<script setup lang="ts" generic="T">
    import { VCard, VDialog, VToolbar, VToolbarTitle, VDivider, VCardActions, VSpacer, VBtn } from 'vuetify/components'
    import MaybeTranslation from '@/components/internal/MaybeTranslation.vue'
    import type { FormDialogComponent, FormDialogProps } from '@/composables/dialog/presets/FormDialogProps'
    import { ref, useTemplateRef } from 'vue'
    import type { DialogComponentEmits } from '@/composables/dialog/types/DialogComponent'
    import useVuelidate from '@vuelidate/core'

    defineProps<{ data: FormDialogProps<T> }>()
    const emit = defineEmits<DialogComponentEmits<T | null>>()

    const formComponent = useTemplateRef<InstanceType<FormDialogComponent<T>>>('formComponent')
    const dialogModel = ref(true)
    const v = useVuelidate()
    const loading = ref(false)

    function closeDialog(): void {
        dialogModel.value = false
    }

    function resolveDialog() {
        emit('resolve', null)
    }
</script>
