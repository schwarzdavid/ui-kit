import type { DefaultsInstance } from 'vuetify'

const field = {
    variant: 'outlined',
    density: 'comfortable',
    color: 'focus',
    baseColor: 'ink',
    hideDetails: 'auto',
} as const

export const defaults: NonNullable<DefaultsInstance> = {
    global: { ripple: false },
    VBtn: { variant: 'outlined', color: 'ink', rounded: 'md' },
    VTextField: field,
    VTextarea: field,
    VSelect: { ...field, menuProps: { offset: 4 } },
    VAutocomplete: field,
    VCombobox: field,
    VNumberInput: { ...field, controlVariant: 'stacked' },
    VCheckbox: { color: 'ink', density: 'compact', hideDetails: 'auto' },
    VSwitch: { color: 'ink', inset: true, density: 'compact', hideDetails: 'auto' },
    VCard: { variant: 'flat', rounded: 'lg', border: true },
    VChip: { size: 'small', density: 'comfortable' },
    VAlert: { variant: 'tonal', density: 'compact', rounded: 'md' },
    VDialog: { scrim: 'scrim', opacity: 0.48, scrollable: true, retainFocus: true },
    VMenu: { offset: 4 },
    VList: { density: 'comfortable' },
    VDataTable: { density: 'comfortable', hover: true },
    VDataTableServer: { density: 'comfortable', hover: true, itemsPerPage: 25 },
    VSnackbar: { color: 'surface-inverse', location: 'bottom', timeout: 4000, rounded: 'lg' },
    VTooltip: { location: 'top', openDelay: 300 },
    VBtnToggle: { variant: 'text', color: 'ink' },
    VNavigationDrawer: { border: 'e', elevation: 0 },
}
