<template>
    <div class="d-flex gc-4">
        <VBtn color="primary" @click="openTextDialog">Text content</VBtn>
        <VBtn color="primary" @click="openComponentDialog">Component content</VBtn>
        <VBtn color="primary" @click="openAdditionalCtaDialog">Additional actions</VBtn>
        <VBtn color="primary" @click="openChoiceCtaDialog">Simple Choice</VBtn>
    </div>
    <div v-if="pill" class="mt-4">
        <p>You chose: {{ pill }}</p>
        <!-- eslint-disable-next-line vue/v-on-handler-style -->
        <VBtn color="secondary" class="mt-2" @click="pill = null">Reset</VBtn>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useDialog } from '../../useDialog'
import InfoDialogContent from './InfoDialogContent.vue'

const dialog = useDialog()
const pill = ref<string | null>(null)

function openTextDialog(): void {
    void dialog.info({
        title: 'Text Dialog',
        translateTitle: false,
        content: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam',
        translateContent: false,
    })
}

function openComponentDialog(): void {
    void dialog.info({
        title: 'Component Dialog',
        translateTitle: false,
        component: InfoDialogContent,
        props: {
            foo: 5,
        },
    })
}

function openAdditionalCtaDialog(): void {
    void dialog.info({
        title: 'Additional Actions',
        translateTitle: false,
        content: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam',
        translateContent: false,
        additionalCta: [
            {
                text: 'Show alert',
                translateText: false,

                action: () => { alert('Test') },
            },
        ],
    })
}

async function openChoiceCtaDialog(): Promise<void> {
    pill.value = await dialog.info<string>({
        title: 'Choice Cta',
        translateTitle: false,
        content: 'You take the blue pill ... the story ends. You take the red pill ... you stay in wonderland',
        translateContent: false,
        defaultCta: false,
        additionalCta: [
            {
                text: 'Red pill',
                translateText: false,
                value: 'Red Pill',
            },
            {
                text: 'Blue pill',
                translateText: false,
                value: 'Blue Pill',
            },
        ],
    })
}
</script>
