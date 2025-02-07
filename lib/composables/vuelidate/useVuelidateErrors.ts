import { computed, type ComputedRef, type Ref, unref } from 'vue'
import type { BaseValidation, Validation, ValidationArgs, ValidationRule } from '@vuelidate/core'

export type ValidationErrors<T extends object> = {
    [key in keyof T]: T[key] extends object ? ValidationErrors<T[key]> : string[]
}

export const useVuelidateErrors = <T extends object>(
    validation: Ref<Validation<ValidationArgs<T>, T>>,
): ComputedRef<ValidationErrors<T>> => computed(() => convertValidationToValidationErrors(validation.value))

function convertValidationToValidationErrors<T extends object>(
    validation: Validation<ValidationArgs<T>, T>,
): ValidationErrors<T> {
    return Object.entries(validation)
        .map(([key, validation]) => {
            if (key.startsWith('$')) {
                return [key, null]
            }
            if (isBaseValidation(validation)) {
                return [key, convertBaseValidationToErrors(validation)]
            }
            if (isNestedValidation(validation)) {
                return [key, convertValidationToValidationErrors(validation)]
            }
            console.warn('Unknown validation type.', key, validation)
            return [key, null]
        })
        .reduce<ValidationErrors<T>>((output, [key, errors]) => {
            if (errors) {
                // @ts-expect-error typescript does not know whether T[key] is an object or not
                output[key] = errors
            }
            return output
        }, {} as ValidationErrors<T>)
}

function isBaseValidation(validation: BaseValidation | unknown): validation is BaseValidation {
    if (typeof validation !== 'object' || validation === null) {
        return false
    }
    return Object.hasOwn(validation, '$model') && Object.entries(validation).filter(([key]) => !key.startsWith('$')).every(([,value]) => isValidationRule(value))
}

function isNestedValidation(validation: Validation | unknown): boolean {
    if (typeof validation !== 'object' || validation === null) {
        return false
    }
    return Object.entries(validation).filter(([key]) => !key.startsWith('$')).some(([,value]) => !isValidationRule(value))
}

function isValidationRule(validation: BaseValidation | unknown): validation is ValidationRule {
    return typeof validation === 'object' && validation !== null && Object.hasOwn(validation, '$params')
}

function convertBaseValidationToErrors(validation: BaseValidation): string[] {
    return validation.$errors.map(error => unref(error.$message))
}
