<template>
    <div class="d-flex flex-column ga-5">
        <div class="d-flex flex-wrap align-center ga-3">
            <VBtn variant="flat" color="primary">Primary</VBtn>
            <VBtn>Secondary</VBtn>
            <VBtn variant="text">Tertiary</VBtn>
            <VBtn variant="flat" color="error">Destructive</VBtn>
            <VBtn variant="flat" color="primary" disabled>Disabled</VBtn>
            <VBtn variant="flat" color="primary" loading>Loading</VBtn>
        </div>
        <div class="d-flex flex-wrap align-center ga-3">
            <VBtn variant="flat" color="primary" size="small">Small</VBtn>
            <VBtn variant="flat" color="primary">Default</VBtn>
            <VBtn variant="flat" color="primary" size="large">Large</VBtn>
            <VBtn :prepend-icon="mdiPlus">With icon</VBtn>
            <VBtn :icon="mdiPencilOutline" variant="text" aria-label="Edit" />
            <VBtn :icon="mdiDeleteOutline" variant="text" color="error" aria-label="Delete" />
        </div>
        <div class="d-flex flex-wrap align-center ga-3">
            <VBtnToggle v-model="view" mandatory>
                <VBtn value="list">List</VBtn>
                <VBtn value="grid">Grid</VBtn>
                <VBtn value="table">Table</VBtn>
            </VBtnToggle>
            <VBtnGroup>
                <VBtn>Previous</VBtn>
                <VBtn>Next</VBtn>
            </VBtnGroup>
        </div>
        <VPagination v-model="page" :length="8" :total-visible="6" />
    </div>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { VBtn, VBtnGroup, VBtnToggle, VPagination } from 'vuetify/components'
    import { mdiDeleteOutline, mdiPencilOutline, mdiPlus } from '@mdi/js'

    const view = ref('list')
    const page = ref(3)
</script>
