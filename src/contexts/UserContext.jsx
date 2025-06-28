'use client'

// React Imports
import { createContext, useContext, useState } from 'react'

// Context definition
const UserContext = createContext()

// Provider component to wrap the app and manage user data
export const UserProvider = ({ children }) => {
  // State for user data
  const [user, setUser] = useState(null)

  // Function to update user data
  const updateUser = newUserData => {
    setUser(prev => ({ ...prev, ...newUserData }))
  }

  return <UserContext.Provider value={{ user, updateUser }}>{children}</UserContext.Provider>
}

// Custom hook to access user context
export const useUser = () => {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }

  return context
}
