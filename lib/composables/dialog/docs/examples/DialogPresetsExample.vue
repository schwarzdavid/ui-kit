<template>
    <div class="d-flex flex-wrap ga-4">
        <DialogPresetsButton label="Built-in confirm" primary @result="show" />
        <UiKitScope :options="options">
            <DialogPresetsButton label="Bottom sheet confirm" @result="show" />
        </UiKitScope>
    </div>
    <p v-if="result !== null" class="mt-4">Last confirm value: {{ result }}</p>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import UiKitScope from '@/docs/examples/UiKitScope.vue'
    import CustomConfirmDialog from '@/docs/examples/CustomConfirmDialog.vue'
    import DialogPresetsButton from '@/composables/dialog/docs/examples/DialogPresetsButton.vue'
    import type { CreateUIKitOptions } from '@/plugin/types/PluginOptions'

    const options: CreateUIKitOptions = {
        components: {
            dialog: { confirm: CustomConfirmDialog },
        },
    }
    const result = ref<boolean | null>(null)

    function show(value: boolean): void {
        result.value = value
    }
</script>
