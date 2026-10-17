<template>
    <div class="d-flex flex-wrap ga-4">
        <VBtn variant="flat" color="primary" @click="openDefaultConfirmDialog">Default confirm</VBtn>
        <VBtn @click="openWarningConfirmDialog">Warning</VBtn>
        <VBtn @click="openDangerousConfirmDialog">Destructive</VBtn>
        <VBtn @click="openCustomConfirmDialog">Custom content</VBtn>
    </div>
    <div v-if="lastChoice !== null" class="mt-4">
        <p>Last confirm value: {{ lastChoice }}</p>
        <VBtn variant="text" class="mt-2" @click="reset">Reset</VBtn>
    </div>
</template>

<script lang="ts" setup>
    import { VBtn } from 'vuetify/components'
    import { ref } from 'vue'
    import { useDialog } from '@/composables/dialog/useDialog'
    import { ConfirmDialogLevel } from '@/composables/dialog/presets/ConfirmDialogProps'
    import ConfirmDialogContent from '@/composables/dialog/docs/examples/ConfirmDialogContent.vue'

    const dialog = useDialog()
    const lastChoice = ref<boolean | null>(null)

    function reset(): void {
        lastChoice.value = null
    }

    async function openDefaultConfirmDialog(): Promise<void> {
        lastChoice.value = await dialog.confirm({
            title: 'Publish draft v4?',
            translateTitle: false,
            content: 'New submissions to sales@acme.com will use this template right away. Published v3 stays in the version history.',
            translateContent: false,
            confirmCta: { text: 'Publish', translateText: false },
            rejectCta: { text: 'Cancel', translateText: false },
        })
    }

    async function openWarningConfirmDialog(): Promise<void> {
        lastChoice.value = await dialog.confirm({
            title: 'Change the sending domain?',
            translateTitle: false,
            content: 'Mails already queued keep the old domain. New mails use the new one right away.',
            translateContent: false,
            level: ConfirmDialogLevel.WARNING,
            confirmCta: { text: 'Change domain', translateText: false },
            rejectCta: { text: 'Cancel', translateText: false },
        })
    }

    async function openDangerousConfirmDialog(): Promise<void> {
        lastChoice.value = await dialog.confirm({
            title: 'Delete user Lisa Schneider?',
            translateTitle: false,
            content: 'Lisa Schneider loses access immediately and is removed from 2 projects. This can\'t be undone. The dialog is permanent, so Escape does nothing.',
            translateContent: false,
            level: ConfirmDialogLevel.DANGER,
            permanent: true,
            confirmCta: { text: 'Delete user', translateText: false },
            rejectCta: { text: 'Cancel', translateText: false },
        })
    }

    async function openCustomConfirmDialog(): Promise<void> {
        lastChoice.value = await dialog.confirm({
            title: 'Custom component',
            translateTitle: false,
            component: ConfirmDialogContent,
            width: 'md',
            confirmCta: { text: 'Confirm', translateText: false },
            rejectCta: { text: 'Cancel', translateText: false },
        })
    }
</script>
