<template>
    <div class="d-flex flex-wrap ga-4">
        <VBtn variant="flat" color="primary" @click="openConfirm">Custom confirm dialog</VBtn>
        <VBtn @click="showToast">Custom toast</VBtn>
    </div>
    <p v-if="result !== null" class="mt-4">Confirmed: {{ result }}</p>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { VBtn } from 'vuetify/components'
    import { useDialog } from '@/composables/dialog/useDialog'
    import { useToast } from '@/composables/toast/useToast'

    const dialog = useDialog()
    const toast = useToast()
    const result = ref<boolean | null>(null)

    async function openConfirm(): Promise<void> {
        result.value = await dialog.confirm({
            title: 'Publish draft v4?',
            translateTitle: false,
            content: 'New submissions will use this template right away.',
            translateContent: false,
        })
    }

    function showToast(): void {
        void toast.success('Project saved', { translateMessage: false, action: { text: 'Undo', translateText: false } })
    }
</script>
