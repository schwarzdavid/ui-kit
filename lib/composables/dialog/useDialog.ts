import InfoDialog from './components/dialog/presets/InfoDialog.vue'
import PromptDialog from './components/dialog/presets/PromptDialog.vue'
import ConfirmDialog from './components/dialog/presets/ConfirmDialog.vue'
import { useDialogQueue } from './internal/useDialogQueue'
import type { ConfirmDialogLevel, ConfirmDialogProps } from './presets/ConfirmDialogProps'
import type { PromptDialogComponent, PromptDialogProps } from './presets/PromptDialogProps'
import type { InfoDialogProps } from './presets/InfoDialogProps'
import type { CreateDialogQueueEntry } from './types/DialogQueueEntry'
import type { Component } from 'vue'
import type { FormDialogProps } from '@/composables/dialog/presets/FormDialogProps'
import FormDialog from '@/composables/dialog/components/dialog/presets/FormDialog.vue'

/* eslint-disable @typescript-eslint/no-invalid-void-type */

export interface DialogComposable {
    info(title: string, content: string): Promise<null>
    info<T = void, C extends Component = Component>(options: InfoDialogProps<T, C>): Promise<T extends void ? null : (T | null)>

    prompt<
        T,
        R extends boolean = false,
        C extends PromptDialogComponent<T> = PromptDialogComponent<T>,
    >(options: PromptDialogProps<T, R, C>): Promise<R extends true ? T : T | null>

    confirm(title: string, content: string, level?: ConfirmDialogLevel): Promise<boolean>
    confirm<C extends Component = Component>(options: ConfirmDialogProps<C>): Promise<boolean>

    form<
        R,
        T = R,
        RejectOnEmpty extends boolean = false,
    >(options: FormDialogProps<R, T, RejectOnEmpty>): Promise<RejectOnEmpty extends true ? R : R | null>
}

export function useDialog(): DialogComposable {
    const dialogQueue = useDialogQueue()

    function createInfoDialog(title: string, content: string): Promise<null>
    function createInfoDialog<T = void>(data: InfoDialogProps<T>): Promise<T extends void ? null : (T | null)>
    function createInfoDialog<T = void>(titleOrData: InfoDialogProps<T> | string, content?: string): Promise<T | null> {
        let data: InfoDialogProps<T>
        if (typeof titleOrData === 'string') {
            data = {
                title: titleOrData,
                content: content ?? '',
            }
        } else {
            data = titleOrData
        }

        return new Promise<T | null>((resolve) => {
            const dialogEntry: CreateDialogQueueEntry<T extends void ? null : T | null, typeof InfoDialog<T>> = {
                component: InfoDialog,
                props: { data },
                resolve,
                reject: () => { resolve(null) },
            }

            dialogQueue.addToQueue(dialogEntry)
        })
    }

    function createPromptDialog<
        T,
        R extends boolean = false,
        C extends PromptDialogComponent<T> = PromptDialogComponent<T>,
    >(
        options: PromptDialogProps<T, R, C>,
    ): Promise<R extends true ? T : T | null> {
        return new Promise<R extends true ? T : T | null>((resolve, reject) => {
            const dialogEntry: CreateDialogQueueEntry<R extends true ? T : T | null, typeof PromptDialog<T, R>> = {
                component: PromptDialog,
                props: { data: options },
                resolve,
                reject,
            }
            dialogQueue.addToQueue(dialogEntry)
        })
    }

    function createConfirmDialog(title: string, content: string, level?: ConfirmDialogLevel): Promise<boolean>
    function createConfirmDialog<C extends Component = Component>(options: ConfirmDialogProps<C>): Promise<boolean>
    function createConfirmDialog<C extends Component = Component>(
        titleOrOptions: ConfirmDialogProps<C> | string,
        content?: string,
        level?: ConfirmDialogLevel,
    ): Promise<boolean> {
        let options: ConfirmDialogProps<C> = titleOrOptions as ConfirmDialogProps<C>
        if (typeof titleOrOptions === 'string' && typeof content === 'string') {
            options = {
                title: titleOrOptions,
                content,
                level,
            }
        }
        return new Promise<boolean>((resolve, reject) => {
            const dialogEntry: CreateDialogQueueEntry<boolean> = {
                component: ConfirmDialog,
                props: { data: options },
                resolve,
                reject,
            }
            dialogQueue.addToQueue(dialogEntry)
        })
    }

    function createFormDialog<
        R,
        T = R,
        RejectOnEmpty extends boolean = false,
    >(options: FormDialogProps<R, T, RejectOnEmpty>): Promise<RejectOnEmpty extends true ? R : R | null> {
        return new Promise<RejectOnEmpty extends true ? R : R | null>((resolve, reject) => {
            const dialogEntry: CreateDialogQueueEntry<RejectOnEmpty extends true ? R : R | null> = {
                component: FormDialog,
                props: { data: options },
                resolve,
                reject,
            }
            dialogQueue.addToQueue(dialogEntry)
        })
    }

    return {
        info: createInfoDialog,
        prompt: createPromptDialog,
        confirm: createConfirmDialog,
        form: createFormDialog,
    }
}
