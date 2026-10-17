<template>
    <div class="d-flex align-center ga-3">
        <VIcon :icon="mdiAlertOutline" color="warning" />
        <p class="ma-0">Are you sure?</p>
    </div>
</template>

<script lang="ts" setup>
    import { VIcon } from 'vuetify/components'
    import { mdiAlertOutline } from '@mdi/js'
</script>
