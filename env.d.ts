/// <reference types="vite/client" />

import 'vue'

declare module 'vue' {
    interface AppContext {
        __SCHWARZDAVID_UIKIT_SYMBOL__: symbol
    }

    interface App {
        __SCHWARZDAVID_UIKIT_SYMBOL__: symbol
    }
}
