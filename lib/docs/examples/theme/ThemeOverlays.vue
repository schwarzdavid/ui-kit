<template>
    <div class="d-flex flex-wrap align-center ga-3">
        <VMenu>
            <template #activator="{ props }">
                <VBtn v-bind="props" :append-icon="mdiChevronDown">Menu</VBtn>
            </template>
            <VList>
                <VListItem title="Duplicate" :prepend-icon="mdiContentCopy" />
                <VListItem title="Rename" :prepend-icon="mdiPencilOutline" />
                <VListItem title="Delete" :prepend-icon="mdiDeleteOutline" base-color="error" />
            </VList>
        </VMenu>
        <VTooltip text="Copies the form with all settings">
            <template #activator="{ props }">
                <VBtn v-bind="props">Hover for tooltip</VBtn>
            </template>
        </VTooltip>
        <VBtn @click="snackbar = true">Show snackbar</VBtn>
        <VDialog max-width="440">
            <template #activator="{ props }">
                <VBtn v-bind="props">Plain VDialog</VBtn>
            </template>
            <template #default="{ isActive }">
                <VCard title="Plain VDialog" text="A Vuetify dialog with the theme defaults, without the ui-kit dialog shell.">
                    <VCardActions>
                        <VSpacer />
                        <VBtn variant="flat" color="primary" @click="isActive.value = false">Close</VBtn>
                    </VCardActions>
                </VCard>
            </template>
        </VDialog>
        <VSnackbar v-model="snackbar" text="Form saved">
            <template #actions>
                <VBtn variant="text" color="inverse-primary" @click="snackbar = false">Undo</VBtn>
            </template>
        </VSnackbar>
    </div>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { VBtn, VCard, VCardActions, VDialog, VList, VListItem, VMenu, VSnackbar, VSpacer, VTooltip } from 'vuetify/components'
    import { mdiChevronDown, mdiContentCopy, mdiDeleteOutline, mdiPencilOutline } from '@mdi/js'

    const snackbar = ref(false)
</script>
