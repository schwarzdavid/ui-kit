import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
    plugins: [
        dts({ bundleTypes: true, tsconfigPath: 'tsconfig.app.json' }),
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
            },
            formats: ['es'],
        },
        rollupOptions: {
            external: [
                'vue',
                'vuetify',
                'vuetify/components',
                'vue-i18n',
                '@vuelidate/core',
                '@vuelidate/validators',
                'lodash-es',
            ],
        },
    },
})
