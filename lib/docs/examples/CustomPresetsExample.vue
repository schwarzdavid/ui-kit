<template>
    <UiKitScope :options="options">
        <CustomPresetsButtons />
    </UiKitScope>
</template>

<script lang="ts" setup>
    import UiKitScope from '@/docs/examples/UiKitScope.vue'
    import CustomPresetsButtons from '@/docs/examples/CustomPresetsButtons.vue'
    import CustomConfirmDialog from '@/docs/examples/CustomConfirmDialog.vue'
    import CustomToast from '@/docs/examples/CustomToast.vue'
    import type { CreateUIKitOptions } from '@/plugin/types/PluginOptions'

    const options: CreateUIKitOptions = {
        components: {
            dialog: { confirm: CustomConfirmDialog },
            toast: CustomToast,
        },
    }
</script>
