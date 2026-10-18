<template>
    <VCard>
        <VDataTable
            v-model="selected"
            :headers="headers"
            :items="items"
            item-value="name"
            show-select
            :items-per-page="5">
            <template #[`item.status`]="{ value }">
                <VChip :color="statusColors[value as Status]">{{ value }}</VChip>
            </template>
        </VDataTable>
    </VCard>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { VCard, VChip, VDataTable } from 'vuetify/components'

    type Status = 'Active' | 'Paused' | 'Failing'

    const statusColors: Record<Status, string> = {
        Active: 'success',
        Paused: 'warning',
        Failing: 'error',
    }

    const headers = [
        { title: 'Form', key: 'name' },
        { title: 'Recipient', key: 'recipient' },
        { title: 'Submissions', key: 'submissions', align: 'end' as const },
        { title: 'Status', key: 'status' },
    ]

    const items = [
        { name: 'Contact request', recipient: 'sales@acme.com', submissions: 1284, status: 'Active' },
        { name: 'Newsletter', recipient: 'marketing@acme.com', submissions: 9312, status: 'Active' },
        { name: 'Job application', recipient: 'jobs@acme.com', submissions: 87, status: 'Paused' },
        { name: 'Support ticket', recipient: 'support@acme.com', submissions: 2410, status: 'Failing' },
        { name: 'Event sign-up', recipient: 'events@acme.com', submissions: 156, status: 'Active' },
        { name: 'Feedback', recipient: 'product@acme.com', submissions: 642, status: 'Active' },
    ]

    const selected = ref<string[]>([])
</script>
