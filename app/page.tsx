import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
      <div className="text-center">
        <h1 className="mb-4 text-5xl font-bold text-orange-600">Resto Iga Bakar</h1>
        <p className="mb-8 text-xl text-gray-600">Sistem Informasi Manajemen Restoran</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-orange-600 px-8 py-3 text-lg font-semibold text-white hover:bg-orange-700"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg border-2 border-orange-600 px-8 py-3 text-lg font-semibold text-orange-600 hover:bg-orange-50"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}
