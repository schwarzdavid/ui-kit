<template>
        <TransitionGroup name="fade" tag="div" class="toast-outlet" :class="outletClasses" @before-leave="onBeforeLeave">
            <ToastEntry v-for="entry in queue" :key="entry.id" :entry="entry"/>
        </TransitionGroup>
</template>

<script lang="ts" setup>
    import { useToastQueue } from '@/composables/toast/internal/useToastQueue'
    import ToastEntry from '@/composables/toast/components/ToastEntry.vue'
    import { useDisplay } from 'vuetify'
    import { computed } from 'vue'

    const { queue } = useToastQueue()
    const { mobile } = useDisplay()

    const outletClasses = computed(() => mobile.value ? '' : 'toast-outlet--desktop')

    function onBeforeLeave(el: Element): void {
        const { width } = el.getBoundingClientRect()
        if (el instanceof HTMLElement) {
            el.style.width = `${width.toFixed()}px`
        }
    }
</script>

<style lang="scss" scoped>
@use "vuetify/settings";

.toast-outlet {
    position: fixed;
    z-index: 9999;
    bottom: settings.$spacer * 2;
    right: settings.$spacer * 2;
    left: settings.$spacer * 2;
    display: flex;
    flex-direction: column;
    row-gap: settings.$spacer * 2;
    pointer-events: none;
}

.fade-move,
.fade-enter-active,
.fade-leave-active {
    transition: all settings.$transition-duration-root settings.$fab-transition-timing-function;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translate(50%, 0) scaleY(0.5);
}

.fade-leave-active {
    position: absolute;
}
</style>
