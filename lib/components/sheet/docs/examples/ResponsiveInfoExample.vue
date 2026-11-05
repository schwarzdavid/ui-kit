<template>
    <VBtn variant="flat" color="primary" @click="open = true">Show quota</VBtn>
    <UiResponsiveDialog
        v-model="open"
        title="Mailbox quota"
        width="sm">
        <template #preview>
            <p>You are using 8.2 GB of 10 GB.</p>
        </template>
        <p>You are using 8.2 GB of your 10 GB quota. Messages in the trash count towards the quota until they are deleted after 30 days.</p>
        <p>Archive old messages or ask an administrator for a larger mailbox if you run out of space.</p>
    </UiResponsiveDialog>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { VBtn } from 'vuetify/components'
    import UiResponsiveDialog from '@/components/sheet/UiResponsiveDialog.vue'

    const open = ref(false)
</script>
