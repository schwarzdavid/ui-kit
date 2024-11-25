<template>
    <VApp :theme="theme">
        <VMain>
            <slot name="story"/>
        </VMain>
    </VApp>
</template>

<script lang="ts" setup>
    import { VApp, VMain } from 'vuetify/components'

    defineProps<{
        theme: string
    }>()
</script>

<style lang="scss">
.v-application__wrap {
    min-height: unset !important;
}
</style>
