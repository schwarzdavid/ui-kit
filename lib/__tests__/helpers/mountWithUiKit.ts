import { type ComponentMountingOptions, mount } from '@vue/test-utils'
import type { Component } from 'vue'
import { createVuetify } from 'vuetify'
import { createI18n } from 'vue-i18n'
import { createUIKit } from '@/plugin/createUIKit'
import type { CreateUIKitOptions } from '@/plugin/types/PluginOptions'
import { vi } from 'vitest'

vi.stubGlobal('visualViewport', window.visualViewport ?? new EventTarget())
vi.stubGlobal('ResizeObserver', class {
    observe() {
        return undefined
    }

    unobserve() {
        return undefined
    }

    disconnect() {
        return undefined
    }
})

type UiKitMountingOptions = Pick<ComponentMountingOptions<Component>, 'props' | 'slots'> & {
    uiKit?: CreateUIKitOptions
    provide?: Record<symbol, unknown>
}

export function mountWithUiKit(component: Component, { uiKit, provide, ...rest }: UiKitMountingOptions = {}) {
    return mount(component, {
        ...rest,
        attachTo: document.body,
        global: {
            plugins: [
                createVuetify(),
                createI18n({ legacy: false, locale: 'en', messages: { en: {} } }),
                createUIKit(uiKit),
            ],
            provide,
            stubs: { 'transition': false, 'transition-group': false },
        },
    })
}
