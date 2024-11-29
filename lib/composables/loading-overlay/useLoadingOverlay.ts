import { ref, type Ref } from 'vue'

const isOverlayActive = ref(false)

export function useLoadingOverlay(): Ref<boolean> {
    return isOverlayActive
}
