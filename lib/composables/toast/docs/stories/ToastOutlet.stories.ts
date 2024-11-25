import type { Meta, StoryObj } from '@storybook/vue3'
import type { DefineComponent } from 'vue'
import ToastOutlet from '@/composables/toast/components/ToastOutlet.vue'
import { h } from 'vue'

const meta: Meta<DefineComponent> = {
    tags: ['hidden'],
}

export default meta

export const Default: StoryObj<DefineComponent> = {
    render: () => h('div', { key: 'toast-outlet' }, [h(ToastOutlet)]),
}
