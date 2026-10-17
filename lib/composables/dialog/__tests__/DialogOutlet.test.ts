import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import DialogOutlet from '@/composables/dialog/components/dialog/DialogOutlet.vue'
import { useDialogEntry } from '@/composables/dialog/useDialogEntry'
import { useDialogQueue } from '@/composables/dialog/internal/useDialogQueue'
import { mountWithUiKit } from '@/__tests__/helpers/mountWithUiKit'

const Preset = defineComponent({
    setup() {
        const { data, resolve } = useDialogEntry<{ title: string }, string>()
        return () => h('button', {
            class: 'preset',
            onClick: () => {
                resolve(`done:${data.title}`)
            },
        }, data.title)
    },
})

describe('DialogOutlet', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('renders every queued entry through a provider and settles it from the preset', async () => {
        const wrapper = mountWithUiKit(DialogOutlet)
        const queue = wrapper.vm.$.appContext.app.runWithContext(() => useDialogQueue())
        const resolve = vi.fn()
        queue.addToQueue({ component: Preset, data: { title: 'Hello' }, resolve, reject: vi.fn() })
        queue.addToQueue({ component: Preset, data: { title: 'World' }, resolve: vi.fn(), reject: vi.fn() })
        await nextTick()
        const buttons = wrapper.findAll('.preset')
        expect(buttons.map(button => button.text())).toEqual(['Hello', 'World'])
        await buttons[0].trigger('click')
        expect(resolve).toHaveBeenCalledWith('done:Hello')
        expect(queue.queue.value).toHaveLength(1)
        expect(wrapper.findAll('.preset')).toHaveLength(1)
    })
})
