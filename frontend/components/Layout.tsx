'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Search', href: '/search' },
    { name: 'Employees', href: '/employees' },
    ...(isAdmin ? [
      { name: 'Upload MIS', href: '/upload/mis' },
      { name: 'Upload Dump', href: '/upload/dump' },
      { name: 'Unmapped Records', href: '/unmapped' },
    ] : []),
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Professional Navigation */}
      <nav className="bg-white shadow-lg border-b border-slate-200 navbar-no-box-sizing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  MIS Analytics Platform
                </h1>
              </div>
              <div className="hidden lg:ml-12 lg:flex lg:space-x-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex sm:items-center sm:space-x-4">
                <div className="text-sm">
                  <div className="font-medium text-slate-900">{user?.name}</div>
                  <div className="text-slate-500 capitalize">{user?.role}</div>
                </div>
                <div className="h-8 w-px bg-slate-300"></div>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className="lg:hidden border-t border-slate-200">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-50">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content with beautiful spacing and background */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {children}
        </div>
      </main>
    </div>
  )
}