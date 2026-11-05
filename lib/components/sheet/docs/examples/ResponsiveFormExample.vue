<template>
    <VBtn variant="flat" color="primary" @click="open = true">Edit profile</VBtn>
    <p v-if="saved" class="mt-4">Saved: {{ saved }}</p>
    <UiResponsiveDialog
        v-model="open"
        v-model:stage="stage"
        title="Edit profile"
        translate-title
        form
        @submit="save">
        <template #preview>
            <p>{{ summary }}</p>
        </template>
        <VTextField v-model="name" label="Name" />
        <VTextField v-model="email" label="Email address" type="email" />
        <VTextarea v-model="bio" label="About you" rows="4" />
        <template #actions>
            <VBtn variant="text" @click="open = false">Cancel</VBtn>
            <VBtn variant="flat" color="primary" type="submit">Save</VBtn>
        </template>
    </UiResponsiveDialog>
</template>

<script lang="ts" setup>
    import { computed, ref } from 'vue'
    import { VBtn, VTextarea, VTextField } from 'vuetify/components'
    import UiResponsiveDialog from '@/components/sheet/UiResponsiveDialog.vue'
    import type { SheetStage } from '@/components/sheet/types/SheetStage'

    const open = ref(false)
    const stage = ref<SheetStage>('preview')
    const name = ref('Ada Lovelace')
    const email = ref('ada@example.com')
    const bio = ref('')
    const saved = ref('')
    const summary = computed(() => `${name.value} - ${email.value}`)

    function save(): void {
        saved.value = summary.value
        open.value = false
    }
</script>
