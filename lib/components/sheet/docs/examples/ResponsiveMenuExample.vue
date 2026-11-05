<template>
    <VBtn variant="flat" color="primary" @click="open = true">Message actions</VBtn>
    <p v-if="chosen" class="mt-4">Chosen: {{ chosen }}</p>
    <UiResponsiveDialog
        v-model="open"
        title="Message actions"
        width="sm"
        :expandable="false">
        <VList :items="items" item-title="title" item-value="id" @click:select="choose" />
    </UiResponsiveDialog>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { VBtn, VList } from 'vuetify/components'
    import UiResponsiveDialog from '@/components/sheet/UiResponsiveDialog.vue'

    interface Action {
        id: string
        title: string
    }

    const items: Action[] = [
        { id: 'reply', title: 'Reply' },
        { id: 'forward', title: 'Forward' },
        { id: 'archive', title: 'Archive' },
        { id: 'spam', title: 'Mark as spam' },
    ]

    const open = ref(false)
    const chosen = ref('')

    function choose(event: { id: unknown }): void {
        chosen.value = items.find(item => item.id === event.id)?.title ?? ''
        open.value = false
    }
</script>
