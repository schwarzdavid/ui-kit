import { fileURLToPath, URL } from 'node:url'

import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import dts from 'vite-plugin-dts'
import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        dts({ rollupTypes: true, tsconfigPath: 'tsconfig.app.json' }),
        vue(),
        vueJsx(),
        libAssetsPlugin(),
        VueI18nPlugin({ runtimeOnly: false }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./lib', import.meta.url)),
        },
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'lib/main.ts'),
            formats: ['es'],
            fileName: 'ui-kit',
            name: 'UiKit',
        },
        rollupOptions: {
            external: [
                'vue',
                'vuetify',
                'vuetify/components',
                'vue-router',
                'pinia',
                'vue-i18n',
                '@vuelidate/core',
                '@vuelidate/validators',
                'lodash',
            ],
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern',
            },
        },
    },
})
