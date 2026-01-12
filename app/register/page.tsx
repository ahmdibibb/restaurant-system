'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { validatePassword, validateEmail, validateName } from '@/lib/validation'
import { Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  })

  // Real-time validation
  useEffect(() => {
    const errors: Record<string, string> = {}

    if (touched.name) {
      if (!formData.name) {
        errors.name = 'Nama tidak boleh kosong'
      } else {
        const nameValidation = validateName(formData.name)
        if (!nameValidation.isValid && nameValidation.error) {
          errors.name = nameValidation.error
        }
      }
    }

    if (touched.email) {
      if (!formData.email) {
        errors.email = 'Email tidak boleh kosong'
      } else {
        const emailValidation = validateEmail(formData.email)
        if (!emailValidation.isValid && emailValidation.error) {
          errors.email = emailValidation.error
        }
      }
    }

    if (touched.password) {
      if (!formData.password) {
        errors.password = 'Password tidak boleh kosong'
      } else {
        const passwordValidation = validatePassword(formData.password)
        if (!passwordValidation.isValid) {
          errors.password = passwordValidation.errors.join(', ')
        }
      }
    }

    if (touched.confirmPassword) {
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Konfirmasi password tidak boleh kosong'
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Password tidak cocok'
      }
    }

    setFieldErrors(errors)
  }, [formData, touched])

  const handleBlur = (field: 'name' | 'email' | 'password' | 'confirmPassword') => {
    setTouched({ ...touched, [field]: true })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Mark all fields as touched
    setTouched({ name: true, email: true, password: true, confirmPassword: true })

    // Validate all fields
    const nameValidation = validateName(formData.name)
    const emailValidation = validateEmail(formData.email)
    const passwordValidation = validatePassword(formData.password)

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Semua field harus diisi')
      return
    }

    if (!nameValidation.isValid || !emailValidation.isValid || !passwordValidation.isValid) {
      setError('Mohon perbaiki kesalahan pada form')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'USER'
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registrasi gagal')
        return
      }

      // Redirect to products page
      router.push('/products')
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-background flex min-h-screen items-center justify-center px-4 py-8">
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white/95 backdrop-blur-sm p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-orange-600">Resto Iga Bakar</h1>
          <p className="mt-2 text-gray-600">Buat akun baru</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              onBlur={() => handleBlur('name')}
              placeholder="Masukkan nama lengkap"
              className={`block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none transition-colors ${fieldErrors.name && touched.name
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                }`}
            />
            {fieldErrors.name && touched.name && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              onBlur={() => handleBlur('email')}
              placeholder="nama@email.com"
              className={`block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none transition-colors ${fieldErrors.email && touched.email
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                }`}
            />
            {fieldErrors.email && touched.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onBlur={() => handleBlur('password')}
                placeholder="Masukkan password"
                className={`block w-full rounded-md border px-3 py-2 pr-10 shadow-sm focus:outline-none transition-colors ${fieldErrors.password && touched.password
                  ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && touched.password && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
            )}
            {!fieldErrors.password && touched.password && formData.password && (
              <p className="mt-1 text-xs text-red-500">
                Password harus minimal 8 karakter, 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 karakter spesial
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Konfirmasi Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="Konfirmasi password"
                className={`block w-full rounded-md border px-3 py-2 pr-10 shadow-sm focus:outline-none transition-colors ${fieldErrors.confirmPassword && touched.confirmPassword
                  ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && touched.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || Object.keys(fieldErrors).length > 0}
            suppressHydrationWarning
            className="w-full rounded-md bg-orange-600 px-4 py-2.5 font-medium text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6"
          >
            {loading ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-medium text-orange-600 hover:text-orange-500">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
