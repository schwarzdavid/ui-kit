<template>
    <VRow>
        <VCol cols="12" md="8">
            <VSkeletonLoader
                v-for="i in 10"
                :key="i"
                :color="model === i ? 'grey' : undefined"
                type="list-item-avatar-two-line"
                class="cursor-default"
                @click="() => model = i" />
        </VCol>
        <VCol v-if="!mobile" cols="4">
            <p class="pa-4">
                This could be a sidebar holding filters and other settings.
            </p>
            <p class="pa-4">
                Elements can also be placed directly in the toolbar through the &lt;teleport&gt; component, for example
                to show a sidebar on small screens. Shrink the window to see it.
            </p>
            <div class="d-flex">
                <VSkeletonLoader type="button" class="flex-grow-1" />
                <VSkeletonLoader type="button" class="flex-grow-1" />
                <VSkeletonLoader type="button" class="flex-grow-1" />
            </div>
        </VCol>
    </VRow>

    <Teleport v-if="mobile" :to="toolbar">
        <VBtn icon="mdi-filter" variant="text" />
    </Teleport>
</template>

<script lang="ts" setup>
    import { VBtn, VCol, VRow, VSkeletonLoader } from 'vuetify/components'
    import { useDisplay } from 'vuetify'

    defineProps<{
        toolbar: HTMLElement
    }>()

    const model = defineModel<number>()
    const { mobile } = useDisplay()
</script>
