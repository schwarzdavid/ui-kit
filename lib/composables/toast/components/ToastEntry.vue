<template>
    <div class="ui-toast" :role="role">
        <VIcon :icon="icon" size="20" class="ui-toast__icon" />
        <span class="ui-toast__message">
            <MaybeTranslation :content="entry.message" :translate="entry.translateMessage" />
        </span>
        <VBtn
            v-if="entry.action"
            variant="text"
            size="small"
            class="ui-toast__action"
            @click="trigger">
            <MaybeTranslation :content="entry.action.text" :translate="entry.action.translateText ?? true" />
        </VBtn>
        <VBtn
            variant="text"
            size="small"
            :icon="Icons.close"
            :aria-label="closeLabel"
            class="ui-toast__close"
            @click="close" />
    </div>
</template>

<script lang="ts" setup>
    import { computed } from 'vue'
    import { VBtn, VIcon } from 'vuetify/components'
    import MaybeTranslation from '@/components/internal/MaybeTranslation.vue'
    import { useToastEntry } from '@/composables/toast/useToastEntry'
    import { ToastType } from '@/composables/toast/types/ToastType'
    import { useMaybeTranslation } from '@/composables/internal/useMaybeTranslation'
    import { usePluginContext } from '@/plugin/composables/usePluginContext'
    import { Icons } from '@/internal/icons'

    const TYPE_ICON_MAP: Record<ToastType, string> = {
        [ToastType.ERROR]: Icons.error,
        [ToastType.SUCCESS]: Icons.success,
        [ToastType.INFO]: Icons.info,
        [ToastType.WARNING]: Icons.warning,
    }

    const { entry, close, trigger } = useToastEntry()
    const { options } = usePluginContext()
    const translate = useMaybeTranslation()
    const closeLabel = computed(() => translate(options.i18n.messages.close, true))
    const icon = computed(() => TYPE_ICON_MAP[entry.type])
    const role = computed(() => entry.type === ToastType.ERROR ? 'alert' : undefined)
</script>

<style lang="scss">
.ui-toast {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 48px;
    padding: 6px 6px 6px 16px;
    border-radius: 10px;
    background: rgb(var(--v-theme-surface-inverse, var(--v-theme-surface-variant)));
    color: rgb(var(--v-theme-on-surface-inverse, var(--v-theme-on-surface-variant)));
    box-shadow: var(--v-shadow-lg, 0 4px 8px rgba(29, 27, 22, 0.08), 0 24px 48px rgba(29, 27, 22, 0.18));
    font-size: 0.875rem;
    line-height: 1.25rem;
    pointer-events: auto;
}

.ui-toast__icon {
    flex: none;
}

.ui-toast__message {
    flex: 1;
    min-width: 0;
    padding: 8px 0;
    overflow-wrap: anywhere;
}

.ui-toast__action {
    color: rgb(var(--v-theme-inverse-primary, var(--v-theme-primary)));
    font-weight: 600;
}

.ui-toast__close {
    color: inherit;
}

.ui-toast .v-btn:focus-visible {
    outline: 2px solid rgb(var(--v-theme-focus, var(--v-theme-primary)));
    outline-offset: 2px;
}
</style>
