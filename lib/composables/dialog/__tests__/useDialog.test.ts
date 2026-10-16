import { describe, expect, it } from 'vitest'
import { useDialog } from '@/composables/dialog/useDialog'
import { useDialogQueue } from '@/composables/dialog/internal/useDialogQueue'
import InfoDialog from '@/composables/dialog/components/dialog/presets/InfoDialog.vue'
import ConfirmDialog from '@/composables/dialog/components/dialog/presets/ConfirmDialog.vue'
import { ConfirmDialogLevel } from '@/composables/dialog/presets/ConfirmDialogProps'
import { createTestApp } from '@/__tests__/helpers/createTestApp'

function setup() {
    const app = createTestApp()
    return {
        dialog: app.runWithContext(() => useDialog()),
        queue: app.runWithContext(() => useDialogQueue()),
    }
}

describe('useDialog', () => {
    it('info(title, content) queues an InfoDialog and resolves with the emitted value', async () => {
        const { dialog, queue } = setup()
        const pending = dialog.info('Title', 'Content')
        const entry = queue.queue.value[0]
        expect(entry.component).toBe(InfoDialog)
        expect(entry.props).toEqual({ data: { title: 'Title', content: 'Content' } })
        entry.resolve(null)
        await expect(pending).resolves.toBeNull()
        expect(queue.queue.value).toHaveLength(0)
    })

    it('info resolves with null when the dialog rejects', async () => {
        const { dialog, queue } = setup()
        const pending = dialog.info('Title', 'Content')
        queue.queue.value[0].reject()
        await expect(pending).resolves.toBeNull()
    })

    it('confirm(title, content, level) queues a ConfirmDialog with the level', async () => {
        const { dialog, queue } = setup()
        const pending = dialog.confirm('Title', 'Content', ConfirmDialogLevel.DANGER)
        const entry = queue.queue.value[0]
        expect(entry.component).toBe(ConfirmDialog)
        expect(entry.props).toEqual({ data: { title: 'Title', content: 'Content', level: ConfirmDialogLevel.DANGER } })
        entry.resolve(true)
        await expect(pending).resolves.toBe(true)
    })

    it('confirm rejects when the dialog rejects', async () => {
        const { dialog, queue } = setup()
        const pending = dialog.confirm({ title: 'Title', content: 'Content', throwOnReject: true })
        queue.queue.value[0].reject('closed')
        await expect(pending).rejects.toBe('closed')
    })
})
