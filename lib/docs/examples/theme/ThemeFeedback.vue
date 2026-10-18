<template>
    <div class="d-flex flex-column ga-5">
        <div class="d-flex flex-column ga-3">
            <VAlert type="success" title="Template published" text="New submissions use version 4." />
            <VAlert type="info" text="Mails are delivered within 5 minutes." />
            <VAlert type="warning" text="The sending domain is not verified yet." />
            <VAlert type="error" title="Couldn't save" text="The server is not reachable." />
        </div>
        <div class="d-flex flex-wrap align-center ga-2">
            <VChip>Default</VChip>
            <VChip color="success">Active</VChip>
            <VChip color="warning">Pending</VChip>
            <VChip color="error">Failed</VChip>
            <VChip color="info">Scheduled</VChip>
            <VChip variant="flat" color="primary">Selected</VChip>
            <VChip closable>Removable</VChip>
            <VBadge content="12" color="error" class="ms-4">
                <VIcon :icon="mdiInboxOutline" />
            </VBadge>
        </div>
        <div class="d-flex flex-wrap align-center ga-6">
            <VProgressCircular indeterminate color="ink" />
            <VProgressCircular :model-value="72" color="success" />
            <div class="flex-grow-1 d-flex flex-column ga-3">
                <VProgressLinear :model-value="40" color="ink" rounded />
                <VProgressLinear indeterminate color="primary" rounded />
            </div>
        </div>
        <div class="d-flex flex-wrap ga-4">
            <VSkeletonLoader type="list-item-avatar-two-line" class="flex-grow-1" />
            <VSkeletonLoader type="paragraph" class="flex-grow-1" />
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { VAlert, VBadge, VChip, VIcon, VProgressCircular, VProgressLinear, VSkeletonLoader } from 'vuetify/components'
    import { mdiInboxOutline } from '@mdi/js'
</script>
