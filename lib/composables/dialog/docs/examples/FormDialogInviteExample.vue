<template>
    <VBtn variant="flat" color="primary" @click="openInviteDialog">Invite member</VBtn>
    <p v-if="invitation !== null" class="mt-4">Invitation {{ invitation.id }} sent to {{ invitation.email }}</p>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { VBtn } from 'vuetify/components'
    import { useDialog } from '@/composables/dialog/useDialog'
    import FormDialogInviteContent from '@/composables/dialog/docs/examples/FormDialogInviteContent.vue'

    interface Invitation {
        id: number
        email: string
    }

    const dialog = useDialog()
    const invitation = ref<Invitation | null>(null)

    async function sendInvitation(address: string): Promise<Invitation> {
        await new Promise(resolve => setTimeout(resolve, 800))
        if (address.includes('taken')) {
            throw new Error(`${address} is already a member of this workspace.`)
        }
        return { id: Math.floor(Math.random() * 9000) + 1000, email: address }
    }

    async function openInviteDialog(): Promise<void> {
        invitation.value = await dialog.form({
            title: 'Invite member',
            translateTitle: false,
            width: 'sm',
            component: FormDialogInviteContent,
            action: sendInvitation,
            saveCta: { text: 'Send invitation', translateText: false },
            abortCta: { text: 'Cancel', translateText: false },
        })
    }
</script>
