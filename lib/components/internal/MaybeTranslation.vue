<template>
    <template v-if="translate">{{ t(content) }}</template>
    <template v-else>{{ content }}</template>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

withDefaults(defineProps<{
    content: string
    translate?: boolean
}>(), {
    translate: true,
})

const { t } = useI18n({ useScope: 'global' })
</script>
