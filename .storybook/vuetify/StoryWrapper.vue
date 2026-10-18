<template>
    <VApp :theme="theme" :class="{ 'story-wrapper--docs': docs }">
        <VMain>
            <div v-if="docs" class="story-wrapper__stage">
                <slot name="story" />
            </div>
            <slot v-else name="story" />
        </VMain>
        <UiKitOutlet />
    </VApp>
</template>

<script lang="ts" setup>
    import { VApp, VMain } from 'vuetify/components'
    import UiKitOutlet from '@/components/UiKitOutlet.vue'

    defineProps<{
        theme: string
        docs: boolean
    }>()
</script>

<style lang="scss">
.v-application__wrap {
    min-height: unset !important;
}

.v-application.story-wrapper--docs {
    background: transparent;
}

.story-wrapper__stage {
    padding: 32px 24px;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 8px;
    background-color: rgb(var(--v-theme-surface));
    background-image: radial-gradient(rgba(var(--v-border-color), 0.08) 1px, transparent 1px);
    background-size: 16px 16px;
}
</style>
