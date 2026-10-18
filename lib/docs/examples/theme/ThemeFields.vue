<template>
    <div class="theme-fields">
        <VTextField v-model="name" label="Form name" />
        <VTextField label="Recipient" placeholder="sales@acme.com" :prepend-inner-icon="mdiEmailOutline" />
        <VTextField model-value="taken@acme.com" label="Email" error-messages="This address is already in use." />
        <VTextField model-value="Locked" label="Disabled" disabled />
        <VSelect v-model="status" label="Status" :items="['Draft', 'Published', 'Archived']" />
        <VAutocomplete label="Owner" :items="people" />
        <VCombobox
            v-model="labels"
            label="Labels"
            :items="['customer', 'urgent', 'invoice']"
            multiple
            chips
            closable-chips />
        <VSelect v-model="channels" label="Notify via" :items="['Email', 'Slack', 'Webhook', 'SMS']" multiple />
        <VNumberInput v-model="limit" label="Daily limit" :min="0" />
        <VTextarea label="Notes" rows="3" class="theme-fields__wide" />
    </div>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { VAutocomplete, VCombobox, VNumberInput, VSelect, VTextarea, VTextField } from 'vuetify/components'
    import { mdiEmailOutline } from '@mdi/js'

    const name = ref('Contact request')
    const status = ref('Draft')
    const labels = ref(['customer'])
    const channels = ref(['Email', 'Slack'])
    const limit = ref(250)
    const people = ['Lisa Schneider', 'Max Huber', 'Anna Berger']
</script>

<style lang="scss">
.theme-fields {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px 16px;
    align-items: start;
}

.theme-fields__wide {
    grid-column: 1 / -1;
}
</style>
