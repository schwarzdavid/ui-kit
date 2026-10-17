import { mdiAlertCircleOutline, mdiAlertOutline, mdiCheckCircleOutline, mdiClose, mdiInformationOutline } from '@mdi/js'

export function svgIcon(path: string): string {
    return `svg:${path}`
}

export const Icons = {
    close: svgIcon(mdiClose),
    success: svgIcon(mdiCheckCircleOutline),
    error: svgIcon(mdiAlertCircleOutline),
    warning: svgIcon(mdiAlertOutline),
    info: svgIcon(mdiInformationOutline),
} as const
