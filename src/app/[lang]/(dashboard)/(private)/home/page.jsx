'use client' // Mark this as a Client Component
import { useSession } from 'next-auth/react'

export default function Page() {
  const { data: session } = useSession()

  console.log(session) // Should show accessToken, name, email, etc.

  return <h1>Bienvenue, {session?.user?.fullName} !</h1>
}
