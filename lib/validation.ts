export interface PasswordValidationResult {
    isValid: boolean
    errors: string[]
}

export interface ValidationResult {
    isValid: boolean
    error?: string
}

/**
 * Validates password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = []

    if (!password) {
        return {
            isValid: false,
            errors: ['Password tidak boleh kosong'],
        }
    }

    if (password.length < 8) {
        errors.push('Password minimal 8 karakter')
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password harus mengandung minimal 1 huruf besar')
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password harus mengandung minimal 1 huruf kecil')
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password harus mengandung minimal 1 angka')
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password harus mengandung minimal 1 simbol (!@#$%^&* dll)')
    }

    return {
        isValid: errors.length === 0,
        errors,
    }
}

/**
 * Validates email format
 */
export function validateEmail(email: string): ValidationResult {
    if (!email) {
        return {
            isValid: false,
            error: 'Email tidak boleh kosong',
        }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return {
            isValid: false,
            error: 'Format email tidak valid',
        }
    }

    return { isValid: true }
}

/**
 * Validates name field
 */
export function validateName(name: string): ValidationResult {
    if (!name || name.trim().length === 0) {
        return {
            isValid: false,
            error: 'Nama tidak boleh kosong',
        }
    }

    if (name.trim().length < 2) {
        return {
            isValid: false,
            error: 'Nama minimal 2 karakter',
        }
    }

    return { isValid: true }
}

/**
 * Validates registration form data
 */
export function validateRegistrationData(data: {
    name: string
    email: string
    password: string
}): { isValid: boolean; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {}

    const nameValidation = validateName(data.name)
    if (!nameValidation.isValid && nameValidation.error) {
        errors.name = [nameValidation.error]
    }

    const emailValidation = validateEmail(data.email)
    if (!emailValidation.isValid && emailValidation.error) {
        errors.email = [emailValidation.error]
    }

    const passwordValidation = validatePassword(data.password)
    if (!passwordValidation.isValid) {
        errors.password = passwordValidation.errors
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    }
}

/**
 * Validates login form data
 */
export function validateLoginData(data: {
    email: string
    password: string
}): { isValid: boolean; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {}

    const emailValidation = validateEmail(data.email)
    if (!emailValidation.isValid && emailValidation.error) {
        errors.email = [emailValidation.error]
    }

    if (!data.password) {
        errors.password = ['Password tidak boleh kosong']
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    }
}
