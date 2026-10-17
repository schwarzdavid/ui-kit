import type { Component } from 'vue'

export interface CreateDialogQueueEntry<Value = unknown, Data = unknown> {
    component: Component
    data: Data
    resolve(value: Value): void
    reject(reason?: unknown): void
}

export interface DialogQueueEntry<Value = unknown, Data = unknown> extends CreateDialogQueueEntry<Value, Data> {
    id: string
}
