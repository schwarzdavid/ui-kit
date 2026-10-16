<template>{{ text }}</template>

<script lang="ts" setup>
    import { computed } from 'vue'
    import { useMaybeTranslation } from '@/composables/internal/useMaybeTranslation'

    const props = withDefaults(defineProps<{
        content: string
        translate?: boolean
    }>(), {
        translate: true,
    })

    const maybeTranslate = useMaybeTranslation()
    const text = computed(() => maybeTranslate(props.content, props.translate))
</script>
