import { CodeOrSourceMdx } from '@storybook/addon-docs/blocks'
import type { ComponentProps } from 'react'

type CodeBlockProps = ComponentProps<typeof CodeOrSourceMdx>

const LANGUAGE_ALIASES: Record<string, string> = {
    vue: 'html',
    scss: 'css',
}

function resolveClassName(className: string | undefined): string | undefined {
    const language = className?.replace(/^language-/, '')
    if (!language || !(language in LANGUAGE_ALIASES)) {
        return className
    }
    return `language-${LANGUAGE_ALIASES[language]}`
}

export function CodeBlock(props: CodeBlockProps): ReturnType<typeof CodeOrSourceMdx> {
    return CodeOrSourceMdx({ ...props, className: resolveClassName(props.className) })
}
