import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import dts from 'vite-plugin-dts'

function emitVuetifySettings(): Plugin {
    return {
        name: 'ui-kit:emit-vuetify-settings',
        apply: 'build',
        generateBundle() {
            this.emitFile({
                type: 'asset',
                fileName: 'vuetify/settings.scss',
                source: readFileSync(resolve(import.meta.dirname, 'lib/vuetify/settings.scss'), 'utf8'),
            })
        },
    }
}

export default defineConfig({
    plugins: [
        dts({ bundleTypes: true, tsconfigPath: 'tsconfig.app.json' }),
        emitVuetifySettings(),
        vue(),
        VueI18nPlugin({ runtimeOnly: false }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./lib', import.meta.url)),
        },
    },
    publicDir: false,
    build: {
        lib: {
            entry: {
                main: resolve(import.meta.dirname, 'lib/main.ts'),
                validators: resolve(import.meta.dirname, 'lib/validators.ts'),
                vuetify: resolve(import.meta.dirname, 'lib/vuetify/index.ts'),
            },
            formats: ['es'],
        },
        rollupOptions: {
            external: [
                'vue',
                /^vuetify(\/.*)?$/,
                'vue-i18n',
                '@vuelidate/core',
                '@vuelidate/validators',
                'lodash-es',
            ],
        },
    },
})
