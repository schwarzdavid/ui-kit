<template>
    <VCardText>Prop "foo" has value: {{ foo }}</VCardText>
    <VTable>
        <thead>
            <tr>
                <th>Spalte 1</th>
                <th>Spalte 2</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Wert 1.1</td>
                <td>Wert 1.2</td>
            </tr>
            <tr>
                <td>Wert 2.1</td>
                <td>Wert 2.2</td>
            </tr>
        </tbody>
    </VTable>
</template>

<script lang="ts" setup>
defineProps<{
    foo: number
}>()
</script>
