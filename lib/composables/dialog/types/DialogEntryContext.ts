export interface DialogEntryContext<Data = unknown, Value = unknown> {
    readonly id: string
    readonly data: Data
    resolve(value: Value): void
    reject(reason?: unknown): void
}
