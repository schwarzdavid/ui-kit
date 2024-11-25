<template>
    <div class="toast-outlet">
        <ToastEntry v-for="entry in queue" :key="entry.id" :entry="entry"/>
    </div>
</template>

<script lang="ts" setup>
    import { useToastQueue } from '@/composables/toast/internal/useToastQueue'
    import ToastEntry from '@/composables/toast/components/ToastEntry.vue'

    const { queue } = useToastQueue()
</script>

<style lang="scss" scoped>
.toast-outlet {
    position: relative;
}
</style>
