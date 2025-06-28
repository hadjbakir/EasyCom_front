'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const AdminGuard = ({ children }) => {
  const user = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.replace('/') // Redirige si pas admin
    }
  }, [user, router])

  if (!user || user.role !== 'admin') return null
  return children
}

export default AdminGuard
