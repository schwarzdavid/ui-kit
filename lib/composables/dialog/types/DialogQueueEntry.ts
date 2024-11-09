import type { ComponentProps } from 'vue-component-type-helpers'
import type { DialogComponent } from './DialogComponent'

export interface DialogQueueEntry<
    Value = unknown,
    Component extends DialogComponent<Value> = DialogComponent<Value>,
> extends CreateDialogQueueEntry<Value, Component> {
    id: string
}

export interface CreateDialogQueueEntry<
    Value = unknown,
    Component extends DialogComponent<Value> = DialogComponent<Value>,
> {
    component: Component
    props: ComponentProps<Component>

    resolve(value: Value): void

    reject(reason?: string): void
}
