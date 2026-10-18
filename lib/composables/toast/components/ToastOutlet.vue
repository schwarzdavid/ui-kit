<template>
    <div class="ui-toast-outlet__announcer" aria-live="polite" aria-atomic="true">
        <MaybeTranslation v-if="announced" :content="announced.message" :translate="announced.translateMessage" />
    </div>
    <TransitionGroup
        name="ui-toast"
        tag="div"
        class="ui-toast-outlet"
        :class="{ 'ui-toast-outlet--mobile': xs }"
        @before-leave="onBeforeLeave">
        <ToastEntryProvider v-for="entry in queue" :key="entry.id" :entry="entry" />
    </TransitionGroup>
</template>

<script lang="ts" setup>
    import { nextTick, onBeforeUnmount, onMounted, shallowRef, watch, watchEffect } from 'vue'
    import { useDisplay } from 'vuetify'
    import MaybeTranslation from '@/components/internal/MaybeTranslation.vue'
    import { useToastQueue } from '@/composables/toast/internal/useToastQueue'
    import ToastEntryProvider from '@/composables/toast/components/ToastEntryProvider.vue'
    import type { ToastQueueEntry } from '@/composables/toast/types/ToastQueueEntry'
    import { ToastType } from '@/composables/toast/types/ToastType'

    const { queue, pause, resume } = useToastQueue()
    const { xs } = useDisplay()
    const announced = shallowRef<ToastQueueEntry | null>(null)
    const announcedEntries = new WeakSet<ToastQueueEntry>()

    watch(() => queue.value.at(-1), (latest) => {
        if (!latest || latest.type === ToastType.ERROR || announcedEntries.has(latest)) {
            return
        }
        announcedEntries.add(latest)
        announced.value = null
        void nextTick(() => {
            announced.value = latest
        })
    })

    const hidden = shallowRef(false)

    function onVisibilityChange(): void {
        hidden.value = document.visibilityState === 'hidden'
    }

    onMounted(() => {
        onVisibilityChange()
        document.addEventListener('visibilitychange', onVisibilityChange)
    })

    onBeforeUnmount(() => {
        document.removeEventListener('visibilitychange', onVisibilityChange)
    })

    watchEffect(() => {
        for (const entry of queue.value) {
            if (hidden.value) {
                pause(entry.id, 'hidden')
            } else {
                resume(entry.id, 'hidden')
            }
        }
    })

    function onBeforeLeave(el: Element): void {
        if (el instanceof HTMLElement) {
            const { width } = el.getBoundingClientRect()
            el.style.width = `${width.toFixed()}px`
        }
    }
</script>

<style lang="scss">
.ui-toast-outlet__announcer {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
}

.ui-toast-outlet {
    position: fixed;
    left: 50%;
    bottom: 16px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: calc(100% - 32px);
    max-width: 560px;
    transform: translateX(-50%);
    pointer-events: none;
}

.ui-toast-outlet--mobile {
    bottom: 8px;
    width: calc(100% - 16px);
}

.ui-toast-move,
.ui-toast-enter-active,
.ui-toast-leave-active {
    transition: opacity 200ms ease, transform 200ms ease;
}

.ui-toast-enter-from,
.ui-toast-leave-to {
    opacity: 0;
    transform: translateY(8px);
}

.ui-toast-leave-active {
    position: absolute;
}

@media (prefers-reduced-motion: reduce) {
    .ui-toast-move,
    .ui-toast-enter-active,
    .ui-toast-leave-active {
        transition-duration: 0s;
    }

    .ui-toast-enter-from,
    .ui-toast-leave-to {
        transform: none;
    }
}
</style>
