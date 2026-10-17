<template>
    <slot />
    <UiKitOutlet />
</template>

<script lang="ts" setup>
    import { provide } from 'vue'
    import UiKitOutlet from '@/components/UiKitOutlet.vue'
    import { UI_KIT_INJECTION_KEY } from '@/plugin/constants/injectionKey'
    import { createPluginContext } from '@/plugin/helper/createPluginContext'
    import { resolvePluginOptions } from '@/plugin/helper/resolvePluginOptions'
    import type { CreateUIKitOptions } from '@/plugin/types/PluginOptions'

    const props = defineProps<{
        options: CreateUIKitOptions
    }>()

    provide(UI_KIT_INJECTION_KEY, createPluginContext(resolvePluginOptions(props.options)))
</script>
