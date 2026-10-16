function isPlainObject(value: object): boolean {
    const prototype: unknown = Object.getPrototypeOf(value)
    return prototype === Object.prototype || prototype === null
}

export function isEmptyValue(value: unknown): boolean {
    if (value === null || value === undefined || value === '') {
        return true
    }
    if (Array.isArray(value)) {
        return value.length === 0
    }
    if (value instanceof Date) {
        return Number.isNaN(value.getTime())
    }
    if (value instanceof Map || value instanceof Set) {
        return value.size === 0
    }
    if (typeof value === 'object') {
        return isPlainObject(value) && Object.keys(value).length === 0
    }
    return false
}
