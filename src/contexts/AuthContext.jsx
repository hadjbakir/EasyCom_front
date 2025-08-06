import { createContext, useContext, useEffect, useState } from 'react'

import { useSession } from 'next-auth/react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const { data: session, status } = useSession()
  const [user, setUser] = useState(null)

  useEffect(() => {
    console.log('AuthProvider useEffect - status:', status, 'session:', session)

    if (status === 'authenticated' && session?.user) {
      setUser(session.user)
    } else if (status === 'unauthenticated') {
      setUser(null)
    }

    // Keep user unchanged during "loading" to avoid null flashes
  }, [session, status])

  console.log('AuthProvider status:', status)
  console.log('AuthProvider session:', session)
  console.log('AuthProvider user:', user)

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const user = useContext(AuthContext)

  console.log('useAuth user:', user)

  return user
}
