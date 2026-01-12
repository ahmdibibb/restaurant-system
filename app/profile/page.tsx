'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar/Navbar'
import { User } from 'lucide-react'

interface UserProfile {
    id: string
    name: string
    email: string
    role: string
    createdAt: string
    totalOrders: number
}

export default function ProfilePage() {
    const router = useRouter()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile', {
                credentials: 'include',
            })

            if (!res.ok) {
                if (res.status === 401) {
                    router.push('/login')
                    return
                }
                throw new Error('Failed to fetch profile')
            }

            const data = await res.json()
            setProfile(data)
            setFormData({
                name: data.name,
                email: data.email,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            })
        } catch (error) {
            console.error('Error fetching profile:', error)
            setError('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        // Validate passwords if changing
        if (formData.newPassword) {
            if (formData.newPassword !== formData.confirmPassword) {
                setError('New passwords do not match')
                return
            }
            if (formData.newPassword.length < 6) {
                setError('Password must be at least 6 characters')
                return
            }
            if (!formData.currentPassword) {
                setError('Current password is required to change password')
                return
            }
        }

        setSaving(true)

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    currentPassword: formData.currentPassword || undefined,
                    newPassword: formData.newPassword || undefined,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Failed to update profile')
                return
            }

            setProfile(data)
            setSuccess('Profile updated successfully!')
            setEditing(false)
            setFormData({
                ...formData,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            })
        } catch (error) {
            console.error('Error updating profile:', error)
            setError('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar title="Resto Iga Bakar" />
                <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent"></div>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar title="Resto Iga Bakar" />
                <div className="mx-auto max-w-2xl px-4 py-12">
                    <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
                        <p className="text-red-600">Failed to load profile</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar title="Resto Iga Bakar" />

            <div className="mx-auto max-w-2xl px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                    <p className="text-gray-600 mt-1">Manage your account information</p>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4">
                        <p className="text-sm text-green-600">{success}</p>
                    </div>
                )}

                {/* Profile Card */}
                <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
                    {/* User Info Header */}
                    <div className="mb-8 pb-6 border-b border-gray-200">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                                <User size={32} className="text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                                <p className="text-gray-600">{profile.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={!editing}
                                className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled={!editing}
                                className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        {editing && (
                            <>
                                <div className="pt-4 border-t border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-4">
                                        Change Password (Optional)
                                    </h4>
                                </div>

                                {/* Current Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                        className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none"
                                        placeholder="Enter current password"
                                    />
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none"
                                        placeholder="Enter new password (min 6 characters)"
                                    />
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-6">
                            {!editing ? (
                                <button
                                    type="button"
                                    onClick={() => setEditing(true)}
                                    className="w-full bg-orange-600 text-white py-3 rounded-xl hover:bg-orange-700 transition-colors font-medium"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 bg-orange-600 text-white py-3 rounded-xl hover:bg-orange-700 transition-colors font-medium disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditing(false)
                                            setError('')
                                            setFormData({
                                                name: profile.name,
                                                email: profile.email,
                                                currentPassword: '',
                                                newPassword: '',
                                                confirmPassword: '',
                                            })
                                        }}
                                        className="px-8 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </form>

                    {/* Account Stats */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4">Account Information</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-xl">
                                <p className="text-2xl font-bold text-gray-900">{profile.totalOrders}</p>
                                <p className="text-xs text-gray-600 mt-1">Total Orders</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-xl">
                                <p className="text-sm font-bold text-gray-900">{profile.role}</p>
                                <p className="text-xs text-gray-600 mt-1">Role</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-xl">
                                <p className="text-sm font-bold text-gray-900">
                                    {new Date(profile.createdAt).toLocaleDateString('id-ID', {
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">Member Since</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
