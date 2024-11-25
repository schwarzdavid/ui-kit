import { type DefineComponent, h } from 'vue'
import DialogOutlet from '../../components/dialog/DialogOutlet.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<DefineComponent> = {
    tags: ['hidden'],
}

export default meta

export const Default: StoryObj<DefineComponent> = {
    render: () => h('div', { key: 'dialog-outlet' }, [h(DialogOutlet)]),
}
