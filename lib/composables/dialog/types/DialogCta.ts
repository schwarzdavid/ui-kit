export interface DialogCta {
    text: string
    translateText: boolean
}

export interface DialogValueCta<T> extends DialogCta {
    value: T
}

export interface DialogActionCta extends DialogCta {
    action(): unknown
}

export type InteractiveDialogCta<T> = DialogActionCta | DialogValueCta<T>
