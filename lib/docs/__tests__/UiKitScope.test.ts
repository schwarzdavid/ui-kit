import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import UiKitScope from '@/docs/examples/UiKitScope.vue'
import { useToast } from '@/composables/toast/useToast'
import { useToastEntry } from '@/composables/toast/useToastEntry'
import { mountWithUiKit } from '@/__tests__/helpers/mountWithUiKit'

const ScopedToast = defineComponent({
    setup() {
        const { entry } = useToastEntry()
        return () => h('div', { class: 'scoped-toast' }, entry.message)
    },
})

const Trigger = defineComponent({
    setup() {
        const toast = useToast()
        return () => h('button', {
            class: 'trigger',
            onClick: () => {
                void toast.success('scoped', { translateMessage: false })
            },
        }, 'go')
    },
})

const Example = defineComponent({
    setup: () => () => h(UiKitScope, { options: { components: { toast: ScopedToast } } }, { default: () => h(Trigger) }),
})

describe('UiKitScope', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('renders toasts through the components given to the scope', async () => {
        const wrapper = mountWithUiKit(Example)
        await wrapper.find('.trigger').trigger('click')
        await nextTick()
        expect(wrapper.find('.scoped-toast').text()).toBe('scoped')
        expect(wrapper.find('.ui-toast').exists()).toBe(false)
    })
})
