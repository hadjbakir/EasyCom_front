'use client'

import { createContext, useState, useContext, useEffect } from 'react'

// Create context
const SavedContext = createContext()

// Provider component
export const SavedProvider = ({ children }) => {
  const [savedItems, setSavedItems] = useState([])

  // Load saved items from localStorage on initial render
  useEffect(() => {
    const storedItems = localStorage.getItem('savedItems')

    if (storedItems) {
      setSavedItems(JSON.parse(storedItems))
    }
  }, [])

  // Save to localStorage whenever savedItems changes
  useEffect(() => {
    localStorage.setItem('savedItems', JSON.stringify(savedItems))
  }, [savedItems])

  // Add item to saved list
  const saveItem = (item) => {
    setSavedItems(prev => {
      // Check if item already exists to avoid duplicates
      const exists = prev.some(i => i.id === item.id && i.type === item.type)

      if (exists) return prev

      // Add new item at the beginning of the array
      return [{ ...item, savedAt: new Date().toISOString() }, ...prev]
    })
  }

  // Remove item from saved list
  const removeItem = (id, type) => {
    setSavedItems(prev => prev.filter(item => !(item.id === id && item.type === type)))
  }

  // Check if an item is saved
  const isItemSaved = (id, type) => {
    return savedItems.some(item => item.id === id && item.type === type)
  }

  return (
    <SavedContext.Provider value={{ savedItems, saveItem, removeItem, isItemSaved }}>
      {children}
    </SavedContext.Provider>
  )
}

// Custom hook to use the saved context
export const useSaved = () => {
  const context = useContext(SavedContext)

  if (!context) {
    throw new Error('useSaved must be used within a SavedProvider')
  }
  
  return context
}
