<template>
    <VApp :theme="theme">
        <VMain>
            <slot name="story"/>
        </VMain>
        <UiKitOutlet/>
    </VApp>
</template>

<script lang="ts" setup>
    import { VApp, VMain } from 'vuetify/components'
    import UiKitOutlet from '@/components/UiKitOutlet.vue'

    defineProps<{
        theme: string
    }>()
</script>

<style lang="scss">
.v-application__wrap {
    min-height: unset !important;
}
</style>
