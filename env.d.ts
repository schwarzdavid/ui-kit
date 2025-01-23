/// <reference types="vite/client" />

import 'vue'

declare module 'vue' {
    interface App {
        __SCHWARZDAVID_UIKIT_SYMBOL__: symbol
    }
}
