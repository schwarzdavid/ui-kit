<template>
    <VBtn variant="flat" color="primary" @click="openSettings">Open settings</VBtn>
    <p v-if="status" class="mt-4">{{ status }}</p>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { VBtn } from 'vuetify/components'
    import { useDialog } from '@/composables/dialog/useDialog'
    import { ConfirmDialogLevel } from '@/composables/dialog/presets/ConfirmDialogProps'

    const dialog = useDialog()
    const status = ref('')

    async function resetSettings(): Promise<void> {
        const confirmed = await dialog.confirm({
            title: 'Reset all settings?',
            translateTitle: false,
            content: 'This dialog was opened from inside the settings dialog and stacks on top of it.',
            translateContent: false,
            level: ConfirmDialogLevel.DANGER,
            confirmCta: { text: 'Reset', translateText: false },
            rejectCta: { text: 'Keep', translateText: false },
        })
        status.value = confirmed ? 'Settings were reset.' : 'Settings were kept.'
    }

    function openSettings(): void {
        void dialog.info({
            title: 'Workspace settings',
            translateTitle: false,
            content: 'The reset button opens a confirm dialog while this one stays open.',
            translateContent: false,
            width: 'md',
            additionalCta: [{ text: 'Reset settings', translateText: false, action: resetSettings }],
        })
    }
</script>
