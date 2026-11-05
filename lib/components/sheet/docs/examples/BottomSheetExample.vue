<template>
    <VBtn variant="flat" color="primary" @click="open = true">Open bottom sheet</VBtn>
    <p class="mt-4">Stage: {{ stage }}</p>
    <UiBottomSheet
        v-model="open"
        v-model:stage="stage"
        title="Filters">
        <template #preview>
            <VCardText class="py-0">{{ filters.length }} filters active</VCardText>
        </template>
        <VList v-model:selected="filters" select-strategy="leaf" lines="one">
            <VListItem
                v-for="filter in options"
                :key="filter.value"
                :value="filter.value"
                :title="filter.title">
                <template #append="{ isSelected }">
                    <VCheckboxBtn :model-value="isSelected" tabindex="-1" />
                </template>
            </VListItem>
        </VList>
        <template #actions>
            <VBtn variant="flat" color="primary" @click="open = false">Apply</VBtn>
        </template>
    </UiBottomSheet>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { VBtn, VCardText, VCheckboxBtn, VList, VListItem } from 'vuetify/components'
    import UiBottomSheet from '@/components/sheet/UiBottomSheet.vue'
    import type { SheetStage } from '@/components/sheet/types/SheetStage'

    const options = [
        { title: 'Unread only', value: 'unread' },
        { title: 'With attachments', value: 'attachments' },
        { title: 'Starred', value: 'starred' },
    ]

    const open = ref(false)
    const stage = ref<SheetStage>('preview')
    const filters = ref<string[]>(['unread', 'attachments', 'starred'])
</script>
