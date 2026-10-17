export interface ToastAction {
    text: string
    translateText?: boolean
    handler?: () => unknown
}
