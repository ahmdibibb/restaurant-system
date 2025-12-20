'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface SimpleNavbarProps {
  title: string
  backHref: string
  backLabel?: string
}

export default function SimpleNavbar({ title, backHref, backLabel = 'Back' }: SimpleNavbarProps) {
  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link
          href={backHref}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
        >
          <ArrowLeft size={20} />
          {backLabel}
        </Link>
        {title && <h1 className="text-2xl font-bold text-orange-600">{title}</h1>}
        {!title && <div></div>}
      </div>
    </nav>
  )
}

