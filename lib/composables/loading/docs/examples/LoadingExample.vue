<template>
    <VBtn :loading="defaultLoading" color="primary" @click="performDefaultAction">Default</VBtn>
    <VBtn color="primary" @click="performOverlayAction">With Overlay</VBtn>
    <p v-if="lastResult !== null" class="mt-4">Last result: {{ lastResult }}</p>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { useLoading } from '@/composables/loading/useLoading'
    import { VBtn } from 'vuetify/components'

    function timeout(millis: number): Promise<string> {
        return new Promise(resolve => setTimeout(() => {
            resolve(Math.random().toFixed(2))
        }, millis))
    }

    const lastResult = ref<string | null>(null)
    const { loading: defaultLoading, action: defaultAction } = useLoading(timeout)
    const { action: overlayAction } = useLoading(timeout, { overlay: true })

    async function performDefaultAction(): Promise<void> {
        lastResult.value = await defaultAction(0)
    }

    async function performOverlayAction(): Promise<void> {
        lastResult.value = await overlayAction(0)
    }
</script>
