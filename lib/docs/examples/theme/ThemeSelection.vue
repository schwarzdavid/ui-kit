<template>
    <div class="d-flex flex-wrap ga-8">
        <div>
            <VCheckbox v-model="checks" label="Send copy to sender" value="copy" />
            <VCheckbox v-model="checks" label="Attach files" value="files" />
            <VCheckbox label="Disabled" disabled />
        </div>
        <VRadioGroup v-model="frequency" label="Digest">
            <VRadio label="Daily" value="daily" />
            <VRadio label="Weekly" value="weekly" />
            <VRadio label="Never" value="never" />
        </VRadioGroup>
        <div>
            <VSwitch v-model="active" label="Form is active" />
            <VSwitch label="Spam filter" />
        </div>
        <div class="theme-selection__slider">
            <VSlider v-model="volume" label="Retention (days)" :max="90" thumb-label />
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { VCheckbox, VRadio, VRadioGroup, VSlider, VSwitch } from 'vuetify/components'

    const checks = ref(['copy'])
    const frequency = ref('weekly')
    const active = ref(true)
    const volume = ref(30)
</script>

<style lang="scss">
.theme-selection__slider {
    flex: 1 1 240px;
}
</style>
