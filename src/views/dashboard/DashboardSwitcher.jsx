'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

import Dashboard from '@/views/dashboard'
import UltraModernAdminDashboard from '@/views/pages/admin'

export default function DashboardSwitcher() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  if (status === 'loading') return null

  if (session?.user?.role?.toLowerCase() === 'admin') {
    return <UltraModernAdminDashboard />
  }

  return <Dashboard />
}
