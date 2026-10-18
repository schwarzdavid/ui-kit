<template>
    <div class="d-flex flex-column ga-6">
        <section v-for="group in groups" :key="group.title">
            <h3 class="text-title-small mb-2">{{ group.title }}</h3>
            <div class="theme-colors__grid">
                <div v-for="token in group.tokens" :key="token" class="theme-colors__swatch">
                    <div class="theme-colors__chip" :style="{ background: colors[token] }" />
                    <div class="text-label-medium">{{ token }}</div>
                    <div class="text-code-small text-ink-muted">{{ colors[token] }}</div>
                </div>
            </div>
        </section>
    </div>
</template>

<script lang="ts" setup>
    import { computed } from 'vue'
    import { useTheme } from 'vuetify'

    const theme = useTheme()
    const colors = computed(() => theme.current.value.colors as Record<string, string>)

    const groups = [
        { title: 'Brand', tokens: ['primary', 'on-primary', 'primary-container', 'on-primary-container', 'inverse-primary'] },
        { title: 'Surfaces', tokens: ['background', 'surface', 'surface-light', 'surface-sunken', 'surface-hover', 'surface-inverse', 'scrim'] },
        { title: 'Ink and borders', tokens: ['ink', 'ink-muted', 'ink-disabled', 'border', 'border-strong', 'focus'] },
        { title: 'Status', tokens: ['success', 'success-container', 'warning', 'warning-container', 'error', 'error-container', 'info', 'info-container'] },
    ]
</script>

<style lang="scss">
.theme-colors__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
    gap: 12px;
}

.theme-colors__chip {
    height: 48px;
    margin-bottom: 6px;
    border: 1px solid rgb(var(--v-theme-border));
    border-radius: 6px;
}
</style>
