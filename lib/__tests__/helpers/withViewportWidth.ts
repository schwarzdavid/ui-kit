function setWidth(width: number) {
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width })
    window.dispatchEvent(new Event('resize'))
}

export async function withViewportWidth<T>(width: number, run: () => Promise<T> | T): Promise<T> {
    const original = window.innerWidth
    setWidth(width)
    try {
        return await run()
    } finally {
        setWidth(original)
    }
}
