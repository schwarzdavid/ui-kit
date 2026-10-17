import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { compileString, type FileImporter } from 'sass'

const SETTINGS_DIR = resolve(import.meta.dirname, '..')
const VUETIFY_LIB = resolve(import.meta.dirname, '../../../node_modules/vuetify/lib')

const vuetifyImporter: FileImporter<'sync'> = {
    findFileUrl(url) {
        if (url === 'vuetify/settings') {
            return pathToFileURL(resolve(VUETIFY_LIB, 'styles/settings'))
        }
        if (url.startsWith('vuetify/lib/')) {
            return pathToFileURL(resolve(VUETIFY_LIB, url.slice('vuetify/lib/'.length)))
        }
        return null
    },
}

function compileProbe(source: string): string {
    return compileString(source, { loadPaths: [SETTINGS_DIR], importers: [vuetifyImporter] }).css
}

describe('vuetify settings.scss', () => {
    it('configures the radius scale and typography of vuetify/settings', () => {
        const css = compileProbe(`
            @use 'sass:map';
            @use 'settings';
            .probe {
                border-radius: map.get(settings.$rounded, 'lg');
                border-top-left-radius: map.get(settings.$rounded, 'md');
                border-top-right-radius: map.get(settings.$rounded, 'sm');
                font-weight: map.get(settings.$typography, 'headline-small', 'weight');
                font-size: map.get(settings.$typography, 'title-large', 'size');
            }
        `)
        expect(css).toContain('border-radius: 10px')
        expect(css).toContain('border-top-left-radius: 6px')
        expect(css).toContain('border-top-right-radius: 4px')
        expect(css).toContain('font-weight: 600')
        expect(css).toContain('font-size: 1.25rem')
    })

    it('is exported under both the .scss and the extensionless subpath', () => {
        const manifest = JSON.parse(readFileSync(resolve(import.meta.dirname, '../../../package.json'), 'utf8')) as { exports: Record<string, unknown> }
        expect(manifest.exports['./vuetify/settings.scss']).toBe('./dist/vuetify/settings.scss')
        expect(manifest.exports['./vuetify/settings']).toBe('./dist/vuetify/settings.scss')
    })

    it('compiles the Vuetify base stylesheet with these settings', { timeout: 60000 }, () => {
        const css = compileProbe(`
            @use 'settings';
            @use 'vuetify/lib/styles/main';
        `)
        expect(css).toMatch(/\.rounded-lg\s*\{\s*border-radius:\s*10px/)
        expect(css).toMatch(/\.text-headline-small[^{]*\{[^}]*font-weight:\s*600/)
    })
})
