import type { Component } from 'vue'
import { useDialogQueue } from '@/composables/dialog/internal/useDialogQueue'
import { usePluginContext } from '@/plugin/composables/usePluginContext'
import type { ConfirmDialogLevel, ConfirmDialogProps } from '@/composables/dialog/presets/ConfirmDialogProps'
import type { InfoDialogProps } from '@/composables/dialog/presets/InfoDialogProps'
import type { FormDialogProps } from '@/composables/dialog/presets/FormDialogProps'
import type { CreateDialogQueueEntry } from '@/composables/dialog/types/DialogQueueEntry'

/* eslint-disable @typescript-eslint/no-invalid-void-type */

export interface DialogComposable {
    info(title: string, content: string): Promise<null>
    info<T = void, C extends Component = Component>(options: InfoDialogProps<T, C>): Promise<T extends void ? null : (T | null)>

    confirm(title: string, content: string, level?: ConfirmDialogLevel): Promise<boolean>
    confirm<C extends Component = Component>(options: ConfirmDialogProps<C>): Promise<boolean>

    form<
        T,
        R = T,
        Required extends boolean = false,
        C extends Component = Component,
    >(options: FormDialogProps<T, R, Required, C>): Promise<Required extends true ? R : R | null>
}

export function useDialog(): DialogComposable {
    const dialogQueue = useDialogQueue()
    const { options: { components: { dialog: components } } } = usePluginContext()

    function createInfoDialog(title: string, content: string): Promise<null>
    function createInfoDialog<T = void>(data: InfoDialogProps<T>): Promise<T extends void ? null : (T | null)>
    function createInfoDialog<T = void>(titleOrData: InfoDialogProps<T> | string, content?: string): Promise<T | null> {
        const data: InfoDialogProps<T> = typeof titleOrData === 'string'
            ? { title: titleOrData, content: content ?? '' }
            : titleOrData

        return new Promise<T | null>((resolve) => {
            const entry: CreateDialogQueueEntry<T | null, InfoDialogProps<T>> = {
                component: components.info,
                data,
                resolve,
                reject: () => { resolve(null) },
            }
            dialogQueue.addToQueue(entry)
        })
    }

    function createConfirmDialog(title: string, content: string, level?: ConfirmDialogLevel): Promise<boolean>
    function createConfirmDialog<C extends Component = Component>(options: ConfirmDialogProps<C>): Promise<boolean>
    function createConfirmDialog<C extends Component = Component>(
        titleOrOptions: ConfirmDialogProps<C> | string,
        content?: string,
        level?: ConfirmDialogLevel,
    ): Promise<boolean> {
        const options: ConfirmDialogProps<C> = typeof titleOrOptions === 'string'
            ? { title: titleOrOptions, content: content ?? '', level }
            : titleOrOptions
        return new Promise<boolean>((resolve, reject) => {
            const entry: CreateDialogQueueEntry<boolean, ConfirmDialogProps<C>> = {
                component: components.confirm,
                data: options,
                resolve,
                reject,
            }
            dialogQueue.addToQueue(entry)
        })
    }

    function createFormDialog<
        T,
        R = T,
        Required extends boolean = false,
        C extends Component = Component,
    >(options: FormDialogProps<T, R, Required, C>): Promise<Required extends true ? R : R | null> {
        return new Promise<Required extends true ? R : R | null>((resolve, reject) => {
            const entry: CreateDialogQueueEntry<Required extends true ? R : R | null, FormDialogProps<T, R, Required, C>> = {
                component: components.form,
                data: options,
                resolve,
                reject,
            }
            dialogQueue.addToQueue(entry)
        })
    }

    return {
        info: createInfoDialog,
        confirm: createConfirmDialog,
        form: createFormDialog,
    }
}
