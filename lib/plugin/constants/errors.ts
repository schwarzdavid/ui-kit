export const Errors = {
    NOT_INSTALLED: '@schwarzdavid/ui-kit is not available in this context. Install it with app.use(createUIKit()) and call its composables inside setup() or app.runWithContext().',
    DIALOG_ENTRY_CONTEXT_MISSING: 'useDialogEntry() must be called inside a dialog preset rendered by UiKitOutlet.',
    DIALOG_FORM_CONTEXT_MISSING: 'useDialogForm() must be called inside a component rendered by the form dialog preset.',
    DIALOG_FORM_NOT_REGISTERED: 'The form dialog cannot submit because no component called useDialogForm(finish).',
    TOAST_ENTRY_CONTEXT_MISSING: 'useToastEntry() must be called inside a toast component rendered by UiKitOutlet.',
} as const
