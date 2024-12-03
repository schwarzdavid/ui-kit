<template>
    <VBtn @click="performDefaultAction" :loading="defaultLoading" color="primary">Default</VBtn>
    <VBtn @click="performOverlayAction" color="primary">With Overlay</VBtn>
</template>

<script lang="ts" setup>
    import { useLoading } from '@/composables/loading/useLoading'
    import { VBtn } from 'vuetify/components'

    function timeout(millis: number): Promise<string> {
        return new Promise(resolve => setTimeout(() => {
            resolve(Math.random().toFixed(2))
        }, millis))
    }

    const { loading: defaultLoading, action: defaultAction } = useLoading(timeout)
    const { action: overlayAction } = useLoading(timeout, { overlay: true })

    async function performDefaultAction() {
        const result = await defaultAction(0)

        console.log(result)
    }

    async function performOverlayAction() {
        const result = await overlayAction(0)

        console.log(result)
    }
</script>
