<template>
    <p class="ma-0">Prop "foo" has value: {{ foo }}</p>
    <VTable density="compact">
        <thead>
            <tr>
                <th>Column 1</th>
                <th>Column 2</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Value 1.1</td>
                <td>Value 1.2</td>
            </tr>
            <tr>
                <td>Value 2.1</td>
                <td>Value 2.2</td>
            </tr>
        </tbody>
    </VTable>
</template>

<script lang="ts" setup>
    import { VTable } from 'vuetify/components'

    defineProps<{
        foo: number
    }>()
</script>
