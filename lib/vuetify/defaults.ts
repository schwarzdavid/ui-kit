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
    VBtnGroup: { variant: 'text', color: 'ink', border: 'thin border-strong', divided: true, rounded: 'md' },
    VTextField: field,
    VTextarea: field,
    VSelect: { ...field, itemColor: 'ink', menuProps: { offset: 4 } },
    VAutocomplete: { ...field, itemColor: 'ink' },
    VCombobox: { ...field, itemColor: 'ink' },
    VNumberInput: { ...field, controlVariant: 'stacked' },
    VCheckbox: { color: 'ink', density: 'compact', hideDetails: 'auto' },
    VSwitch: { color: 'ink', baseColor: 'border-strong', inset: true, density: 'compact', hideDetails: 'auto' },
    VCard: { variant: 'flat', rounded: 'lg', border: true },
    VChip: { size: 'small', density: 'comfortable' },
    VAlert: { variant: 'tonal', density: 'compact', rounded: 'md' },
    VDialog: { scrim: 'scrim', opacity: 0.48, scrollable: true, retainFocus: true },
    VMenu: { offset: 4 },
    VDivider: { color: 'border' },
    VList: { density: 'comfortable', color: 'ink', activeClass: 'bg-primary-container' },
    VListItem: { color: 'ink', activeClass: 'bg-primary-container' },
    VExpansionPanels: { flat: true, rounded: 'lg', class: 'border' },
    VProgressLinear: { bgOpacity: 0.12, bufferOpacity: 0.12 },
    VDataTable: { density: 'comfortable', hover: true },
    VDataTableServer: { density: 'comfortable', hover: true, itemsPerPage: 25 },
    VSnackbar: { color: 'surface-inverse', location: 'bottom', timeout: 4000, rounded: 'lg' },
    VTooltip: { location: 'top', openDelay: 300 },
    VBtnToggle: { variant: 'text', color: 'ink' },
    VNavigationDrawer: { border: 'e', elevation: 0 },
}
