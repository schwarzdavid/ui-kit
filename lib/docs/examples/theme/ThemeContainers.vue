<template>
    <div class="theme-containers">
        <VCard title="Contact request" subtitle="sales@acme.com" text="Sends every submission to the sales team and a copy to the sender.">
            <VCardActions>
                <VSpacer />
                <VBtn variant="text">Preview</VBtn>
                <VBtn variant="flat" color="primary">Edit</VBtn>
            </VCardActions>
        </VCard>
        <VCard>
            <VList v-model:selected="selected" mandatory>
                <VListSubheader>Folders</VListSubheader>
                <VListItem value="inbox" title="Inbox" subtitle="12 unread" :prepend-icon="mdiInboxOutline" />
                <VListItem value="sent" title="Sent" :prepend-icon="mdiSendOutline" />
                <VListItem value="archive" title="Archive" :prepend-icon="mdiArchiveOutline" />
                <VDivider class="my-1" />
                <VListItem title="Settings" :prepend-icon="mdiCogOutline" />
            </VList>
        </VCard>
        <VCard class="theme-containers__wide">
            <VTabs v-model="tab">
                <VTab value="general">General</VTab>
                <VTab value="recipients">Recipients</VTab>
                <VTab value="spam">Spam</VTab>
            </VTabs>
            <VDivider />
            <VCardText>Content of the "{{ tab }}" tab.</VCardText>
        </VCard>
        <VExpansionPanels class="theme-containers__wide">
            <VExpansionPanel title="Delivery" text="Mails are sent through the configured SMTP server." />
            <VExpansionPanel title="Attachments" text="Up to 10 files with 20 MB in total." />
        </VExpansionPanels>
    </div>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import {
        VBtn,
        VCard,
        VCardActions,
        VCardText,
        VDivider,
        VExpansionPanel,
        VExpansionPanels,
        VList,
        VListItem,
        VListSubheader,
        VSpacer,
        VTab,
        VTabs,
    } from 'vuetify/components'
    import { mdiArchiveOutline, mdiCogOutline, mdiInboxOutline, mdiSendOutline } from '@mdi/js'

    const selected = ref(['inbox'])
    const tab = ref('general')
</script>

<style lang="scss">
.theme-containers {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    align-items: start;
}

.theme-containers__wide {
    grid-column: 1 / -1;
}
</style>
