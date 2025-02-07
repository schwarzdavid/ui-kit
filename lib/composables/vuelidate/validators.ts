import * as validators from '@vuelidate/validators'
import { helpers } from '@vuelidate/validators'
import { useI18n } from 'vue-i18n'
import { usePluginContext } from '@/plugin/composables/usePluginContext.ts'
import type { PluginI18nValidationTransform } from '@/plugin/types/PluginOptions.ts'
import { camelCase, kebabCase, snakeCase, upperFirst } from 'lodash'

const withI18nMessage = validators.createI18nMessage({
    t: (...args) => {
        const { t } = useI18n({ useScope: 'global' })
        return t(...args)
    },
    messagePath(params) {
        const { options: { i18n: { validation: options } } } = usePluginContext()
        if (typeof options === 'function') {
            return options(params.$validator)
        }
        const validator = transformValidator(params.$validator, options.transform)
        return `${options.prefix}.${validator}`
    },
})

function transformValidator(validator: string, transform: PluginI18nValidationTransform): string {
    switch (transform) {
        case 'camelCase':
            return camelCase(validator)
        case 'kebab-case':
            return kebabCase(validator)
        case 'snake_case':
            return snakeCase(validator)
        case 'PascalCase':
            return upperFirst(camelCase(validator))
        default:
            return validator
    }
}

export const required = withI18nMessage(validators.required)
export const requiredIf = withI18nMessage(validators.requiredIf, { withArguments: true })
export const requiredUnless = withI18nMessage(validators.requiredUnless, { withArguments: true })
export const minLength = withI18nMessage(validators.minLength, { withArguments: true })
export const maxLength = withI18nMessage(validators.maxLength, { withArguments: true })
export const minValue = withI18nMessage(validators.minValue, { withArguments: true })
export const maxValue = withI18nMessage(validators.maxValue, { withArguments: true })
export const between = withI18nMessage(validators.between, { withArguments: true })
export const alpha = withI18nMessage(validators.alpha)
export const alphaNum = withI18nMessage(validators.alphaNum)
export const numeric = withI18nMessage(validators.numeric)
export const integer = withI18nMessage(validators.integer)
export const decimal = withI18nMessage(validators.decimal)
export const email = withI18nMessage(validators.email)
export const ipAddress = withI18nMessage(validators.ipAddress)
export const maxAddress = withI18nMessage(validators.macAddress)
export const sameAs = withI18nMessage(validators.sameAs, { withArguments: true })
export const url = withI18nMessage(validators.url)

export const oneOf = withI18nMessage((values: Record<string, string> | string[]) => helpers.withParams({
    type: 'oneOf',
    values,
}, (value: string) => {
    const arrayValues = Array.isArray(values) ? values : Object.values(values)
    return !helpers.req(value) || arrayValues.includes(value)
}), { withArguments: true })
