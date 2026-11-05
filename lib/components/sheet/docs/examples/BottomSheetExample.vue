<template>
    <VBtn variant="flat" color="primary" @click="open = true">Open bottom sheet</VBtn>
    <p class="mt-4">Stage: {{ stage }}</p>
    <UiBottomSheet
        v-model="open"
        v-model:stage="stage"
        title="Filters">
        <template #preview>
            <p>3 filters active</p>
        </template>
        <VCheckbox v-model="unread" label="Unread only" hide-details />
        <VCheckbox v-model="attachments" label="With attachments" hide-details />
        <VCheckbox v-model="starred" label="Starred" hide-details />
        <template #actions>
            <VBtn variant="flat" color="primary" @click="open = false">Apply</VBtn>
        </template>
    </UiBottomSheet>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { VBtn, VCheckbox } from 'vuetify/components'
    import UiBottomSheet from '@/components/sheet/UiBottomSheet.vue'
    import type { SheetStage } from '@/components/sheet/types/SheetStage'

    const open = ref(false)
    const stage = ref<SheetStage>('preview')
    const unread = ref(true)
    const attachments = ref(true)
    const starred = ref(true)
</script>
