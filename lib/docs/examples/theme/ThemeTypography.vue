<template>
    <div class="d-flex flex-column ga-3">
        <div v-for="role in roles" :key="role" class="d-flex align-baseline ga-4">
            <span class="text-code-small text-ink-muted theme-typography__name">text-{{ role }}</span>
            <span :class="`text-${role}`">Inbound forms for Acme</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
    const roles = [
        'display-small',
        'headline-small',
        'title-large',
        'title-medium',
        'title-small',
        'body-large',
        'body-medium',
        'body-small',
        'label-large',
        'label-medium',
        'label-small',
        'code-medium',
        'code-small',
    ]
</script>

<style lang="scss">
.theme-typography__name {
    flex: 0 0 160px;
}
</style>
