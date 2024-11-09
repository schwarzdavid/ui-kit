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
                Ich könnte eine Sidebar sein, auf der Filter und andere Einstellungen zu sehen sein
                könnten.
            </p>
            <p class="pa-4">
                Außerdem können Elemente direkt in der Toolbar mittels der &lt;teleport&gt; Component
                platziert werden, um bspw. eine Sidebar auf kleinen Geräten anzuzeigen. Mach den Bildschirm klein für
                eine Demo.
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
import { VBtn, VRow, VCol, VSkeletonLoader } from 'vuetify/components'
import { useDisplay } from 'vuetify'

defineProps<{
    toolbar: HTMLElement
}>()

const model = defineModel<number>()
const { mobile } = useDisplay()
</script>
