const FONT_SANS = '"Noto Sans", system-ui, -apple-system, "Segoe UI", sans-serif'

export const themeVariables = {
    'border-opacity': 1,
    'high-emphasis-opacity': 1,
    'medium-emphasis-opacity': 0.72,
    'disabled-opacity': 0.38,
    'hover-opacity': 0.06,
    'focus-opacity': 0.1,
    'pressed-opacity': 0.14,
    'selected-opacity': 0.1,
    'activated-opacity': 0.12,
    'dragged-opacity': 0.08,
    'font-body': FONT_SANS,
    'font-heading': FONT_SANS,
} satisfies Record<string, string | number>
