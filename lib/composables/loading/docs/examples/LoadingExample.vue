<template>
    <VBtn @click="performAction" :loading="loading">Hi</VBtn>
</template>

<script lang="ts" setup>
    import { useLoading } from '@/composables/loading/useLoading'
    import { VBtn } from 'vuetify/components'

    function timeout(millis: number): Promise<string> {
        return new Promise(resolve => setTimeout(() => {
            resolve(Math.random().toFixed(2))
        }, millis))
    }

    const { loading, action } = useLoading(timeout, { overlay: true })

    async function performAction() {
        const result = await action(5000)

        console.log(result)
    }
</script>
