<template>
    <div class="d-flex gc-4">
        <VBtn variant="flat" color="primary" @click="openTextDialog">Text content</VBtn>
        <VBtn @click="openComponentDialog">Component content</VBtn>
        <VBtn @click="openAdditionalCtaDialog">Additional actions</VBtn>
        <VBtn @click="openChoiceCtaDialog">Simple Choice</VBtn>
    </div>
    <p v-if="actionCount" class="mt-4">Action triggered {{ actionCount }} times</p>
    <div v-if="pill" class="mt-4">
        <p>You chose: {{ pill }}</p>
        <VBtn variant="text" class="mt-2" @click="reset">Reset</VBtn>
    </div>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { useDialog } from '@/composables/dialog/useDialog'
    import InfoDialogContent from '@/composables/dialog/docs/examples/InfoDialogContent.vue'
    import { VBtn } from 'vuetify/components'

    const dialog = useDialog()
    const pill = ref<string | null>(null)
    const actionCount = ref(0)

    function reset(): void {
        pill.value = null
    }

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
            width: 'md',
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
                    text: 'Trigger action',
                    translateText: false,
                    action: () => { actionCount.value++ },
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
