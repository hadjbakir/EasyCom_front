'use client'
import { usePathname } from 'next/navigation'

import ChatbotWidget from './ChatbotWidget'

export default function ChatbotWrapper() {
  const pathname = usePathname()

  // Hide on any /[lang]/login, /[lang] (landing), root, or /[lang]/front-pages/landing-page
  const isLoginPage = /\/login$/.test(pathname)
  const isLandingPage = /^\/[a-zA-Z-]+\/?$/.test(pathname) || pathname === '/'
  const isFrontLanding = /\/front-pages\/landing-page$/.test(pathname)

  if (isLoginPage || isLandingPage || isFrontLanding) return null

  return <ChatbotWidget />
}
