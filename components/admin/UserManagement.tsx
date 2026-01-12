'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Edit, Trash2, Shield, User as UserIcon, ChefHat } from 'lucide-react'

interface User {
    id: string
    email: string
    name: string
    role: string
    createdAt: string
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '',
        role: 'USER',
    })

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users', {
                credentials: 'include',
            })
            const data = await res.json()
            // Ensure data is an array
            setUsers(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error fetching users:', error)
            setUsers([])
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            const url = editingUser
                ? `/api/admin/users/${editingUser.id}`
                : '/api/admin/users'
            const method = editingUser ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Failed to save user')
                return
            }

            setShowForm(false)
            setEditingUser(null)
            setFormData({ email: '', name: '', password: '', role: 'USER' })
            fetchUsers()
        } catch (error) {
            console.error('Error saving user:', error)
            setError('Network error. Please try again.')
        }
    }

    const handleEdit = (user: User) => {
        setEditingUser(user)
        setFormData({
            email: user.email,
            name: user.name,
            password: '',
            role: user.role,
        })
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return

        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            })

            const data = await res.json()

            if (!res.ok) {
                alert(data.error || 'Failed to delete user')
                return
            }

            fetchUsers()
        } catch (error) {
            console.error('Error deleting user:', error)
            alert('Network error. Please try again.')
        }
    }

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <Shield size={16} className="text-purple-600" />
            case 'KITCHEN':
                return <ChefHat size={16} className="text-blue-600" />
            default:
                return <UserIcon size={16} className="text-gray-600" />
        }
    }

    const getRoleBadge = (role: string) => {
        const colors = {
            ADMIN: 'bg-purple-100 text-purple-800',
            KITCHEN: 'bg-blue-100 text-blue-800',
            USER: 'bg-gray-100 text-gray-800',
        }
        return colors[role as keyof typeof colors] || colors.USER
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Users className="text-orange-600" size={28} />
                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                </div>
                <button
                    onClick={() => {
                        setEditingUser(null)
                        setFormData({ email: '', name: '', password: '', role: 'USER' })
                        setShowForm(true)
                    }}
                    className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 transition-all"
                >
                    <Plus size={20} />
                    Add User
                </button>
            </div>

            {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {showForm && (
                <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                    <h3 className="mb-4 text-xl font-semibold">
                        {editingUser ? 'Edit User' : 'Add New User'}
                    </h3>
                    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="w-full rounded-xl border-2 border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="w-full rounded-xl border-2 border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password {editingUser && '(leave blank to keep current)'}
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required={!editingUser}
                                className="w-full rounded-xl border-2 border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full rounded-xl border-2 border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
                            >
                                <option value="USER">User</option>
                                <option value="KITCHEN">Kitchen</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 flex gap-2">
                            <button
                                type="submit"
                                className="rounded-xl bg-orange-600 px-6 py-2 text-white hover:bg-orange-700"
                            >
                                {editingUser ? 'Update' : 'Create'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false)
                                    setEditingUser(null)
                                    setError('')
                                }}
                                className="rounded-xl border-2 border-gray-300 px-6 py-2 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto rounded-2xl bg-white shadow-lg">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                                        {user.name}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                                        {user.email}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadge(user.role)}`}>
                                            {getRoleIcon(user.role)}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                        {new Date(user.createdAt).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No users found. Click "Add User" to create one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
