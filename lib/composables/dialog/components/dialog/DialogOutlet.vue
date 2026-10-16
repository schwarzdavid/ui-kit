<template>
    <Component
        :is="entry.component"
        v-for="entry in queue"
        :key="entry.id"
        v-bind="entry.props"
        @resolve="entry.resolve"
        @reject="entry.reject" />
</template>

<script lang="ts" setup>
    import { useDialogQueue } from '@/composables/dialog/internal/useDialogQueue'

    const { queue } = useDialogQueue()
</script>
