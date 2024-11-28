<template>
    <div class="toast-outlet" :class="outletClasses">
        <VSlideYTransition group>
            <ToastEntry v-for="entry in queue" :key="entry.id" :entry="entry"/>
        </VSlideYTransition>
    </div>
</template>

<script lang="ts" setup>
    import { useToastQueue } from '@/composables/toast/internal/useToastQueue'
    import ToastEntry from '@/composables/toast/components/ToastEntry.vue'
    import { VSlideYTransition } from 'vuetify/components'
    import { useDisplay } from 'vuetify'
    import { computed } from 'vue'

    const { queue } = useToastQueue()
    const { mobile } = useDisplay()

    const outletClasses = computed(() => mobile.value ? '' : 'toast-outlet--desktop')
</script>

<style lang="scss" scoped>
@use "vuetify/settings";

.toast-outlet {
    position: fixed;
    z-index: 9999;
    bottom: settings.$spacer * 2;
    right: settings.$spacer * 2;
    left: settings.$spacer * 2;
    display: grid;
    grid-gap: settings.$spacer * 2;
    pointer-events: none;
}
</style>
