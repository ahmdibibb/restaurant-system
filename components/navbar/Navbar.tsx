'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Clock, MapPin, ShoppingCart } from 'lucide-react'

interface CartItem {
  productId: string
  quantity: number
}

interface NavbarProps {
  title: string
  showCart?: boolean
  cart?: CartItem[]
  cartHref?: string
  sticky?: boolean
}

export default function Navbar({ 
  title, 
  showCart = false, 
  cart = [], 
  cartHref = '/cart',
  sticky = false 
}: NavbarProps) {
  const router = useRouter()
  
  // Initialize with current time immediately
  const getFormattedTime = () => {
    const now = new Date()
    const timeString = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    const dateString = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    return `${dateString} - ${timeString}`
  }
  
  const [currentTime, setCurrentTime] = useState<string>(getFormattedTime())
  const [location, setLocation] = useState<string>('Mendapatkan lokasi...')

  useEffect(() => {
    // Update time every second
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      const dateString = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      setCurrentTime(`${dateString} - ${timeString}`)
    }

    // Set initial time immediately
    updateTime()
    const timeInterval = setInterval(updateTime, 1000)

    // Get location
    const getLocation = async () => {
      try {
        if (typeof window !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords
              try {
                const response = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=id`,
                  {
                    method: 'GET',
                    headers: {
                      'Accept': 'application/json',
                    },
                  }
                )
                
                if (!response.ok) {
                  throw new Error('Failed to fetch location')
                }
                
                const data = await response.json()
                
                if (data.city || data.locality) {
                  const cityName = data.city || data.locality || data.principalSubdivision || ''
                  const countryName = data.countryName || 'Indonesia'
                  setLocation(`${cityName}, ${countryName}`)
                } else if (data.principalSubdivision) {
                  setLocation(`${data.principalSubdivision}, ${data.countryName || 'Indonesia'}`)
                } else {
                  setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
                }
              } catch (error) {
                console.error('Error fetching location name:', error)
                setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
              }
            },
            (error) => {
              console.error('Geolocation error:', error)
              const PERMISSION_DENIED = 1
              const POSITION_UNAVAILABLE = 2
              const TIMEOUT = 3
              
              if (error.code === PERMISSION_DENIED) {
                setLocation('Izin lokasi ditolak')
              } else if (error.code === POSITION_UNAVAILABLE) {
                setLocation('Lokasi tidak tersedia')
              } else if (error.code === TIMEOUT) {
                setLocation('Timeout mendapatkan lokasi')
              } else {
                setLocation('Lokasi tidak dapat diakses')
              }
            },
            {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 300000,
            }
          )
        } else {
          setLocation('Geolocation tidak didukung')
        }
      } catch (error) {
        console.error('Error in getLocation:', error)
        setLocation('Error mendapatkan lokasi')
      }
    }

    getLocation()

    return () => {
      clearInterval(timeInterval)
    }
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const navClassName = sticky 
    ? "sticky top-0 z-50 bg-white shadow-md"
    : "bg-white shadow-sm"

  return (
    <nav className={navClassName}>
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-orange-600">{title}</h1>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            {/* Realtime Clock */}
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-700">
              <Clock size={18} className="text-orange-600 flex-shrink-0" />
              <span className="font-medium break-words min-w-0">
                {currentTime || 'Memuat waktu...'}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-700">
              <MapPin size={18} className="text-orange-600 flex-shrink-0" />
              <span className="font-medium break-words min-w-0">
                {location || 'Memuat lokasi...'}
              </span>
            </div>

            {/* Cart Button (if showCart is true) */}
            {showCart && (
              <Link
                href={cartHref}
                className="group relative flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white transition-all hover:bg-orange-700 hover:scale-105 active:scale-95"
              >
                <ShoppingCart size={20} className="transition-transform group-hover:scale-110" />
                <span>Cart ({cart.length})</span>
                {cart.length > 0 && (
                  <span className="absolute -right-2 -top-2 animate-bounce rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Link>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 transition-all hover:bg-gray-50 hover:scale-105 active:scale-95 w-full md:w-auto"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

