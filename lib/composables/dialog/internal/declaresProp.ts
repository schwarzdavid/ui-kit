import type { Component } from 'vue'

export function declaresProp(component: Component, name: string): boolean {
    const props: unknown = (component as { props?: unknown }).props
    if (Array.isArray(props)) {
        return props.includes(name)
    }
    return typeof props === 'object' && props !== null && name in props
}
