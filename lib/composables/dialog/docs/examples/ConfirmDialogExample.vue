<template>
    <div class="d-flex gc-4">
        <VBtn color="primary" @click="openDefaultConfirmDialog">Default Confirm choice</VBtn>
        <VBtn color="primary" @click="openWarningConfirmDialog">Warning choice</VBtn>
        <VBtn color="primary" @click="openDangerousConfirmDialog">Dangerous choice</VBtn>
        <VBtn color="primary" @click="openCustomConfirmDialog">Custom content</VBtn>
    </div>
    <div v-if="lastChoice !== null" class="mt-4">
        <p>Last confirm value: {{ lastChoice }}</p>
        <!-- eslint-disable-next-line vue/v-on-handler-style -->
        <VBtn color="secondary" class="mt-2" @click="lastChoice=null">Reset</VBtn>
    </div>
</template>

<script lang="ts" setup>
    import { VBtn } from 'vuetify/components'
    import { ref } from 'vue'
    import { useDialog } from '../../useDialog'
    import { ConfirmDialogLevel } from '../../presets/ConfirmDialogProps'
    import ConfirmDialogContent from './ConfirmDialogContent.vue'

    const dialog = useDialog()
    const lastChoice = ref<boolean | null>(null)

    async function openDefaultConfirmDialog(): Promise<void> {
        lastChoice.value = await dialog.confirm({
            title: 'Are you sure?',
            translateTitle: false,
            content: 'Please confirm your choice to process',
            translateContent: false,
        })
    }

    async function openWarningConfirmDialog(): Promise<void> {
        lastChoice.value = await dialog.confirm({
            title: 'Warning',
            translateTitle: false,
            content: 'This change cannot be reverted',
            translateContent: false,
            level: ConfirmDialogLevel.WARNING,
        })
    }

    async function openDangerousConfirmDialog(): Promise<void> {
        lastChoice.value = await dialog.confirm({
            title: 'Attention!',
            translateTitle: false,
            content: 'Are you sure to delete this item? This change cannot be undone and can be potentially dangerous. (The dialog is permanent)',
            translateContent: false,
            level: ConfirmDialogLevel.DANGER,
            permanent: true,
        })
    }

    async function openCustomConfirmDialog(): Promise<void> {
        lastChoice.value = await dialog.confirm({
            title: 'Custom component',
            translateTitle: false,
            component: ConfirmDialogContent,
            props: {},
            confirmCta: {
                text: 'Drück mich',
                translateText: false,
            },
            rejectCta: {
                text: 'Drück mich',
                translateText: false,
            },
        })
    }
</script>
