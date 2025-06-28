"use client"

import { createContext, useState, useContext, useEffect } from "react"

// Create context
const NegotiationContext = createContext()

// Provider component
export const NegotiationProvider = ({ children }) => {
  const [negotiations, setNegotiations] = useState([])
  const [activeNegotiation, setActiveNegotiation] = useState(null)

  // Load negotiations from localStorage on initial render
  useEffect(() => {
    const storedNegotiations = localStorage.getItem("negotiations")
    
    if (storedNegotiations) {
      setNegotiations(JSON.parse(storedNegotiations))
    }
  }, [])

  // Save to localStorage whenever negotiations changes
  useEffect(() => {
    localStorage.setItem("negotiations", JSON.stringify(negotiations))
  }, [negotiations])

  // Start a new negotiation
  const startNegotiation = (productId, initialPrice, proposedPrice) => {
    // Check if there's already an active negotiation for this product
    const existingNegotiation = negotiations.find(
      (n) => n.productId === productId && ["pending", "counter_offered"].includes(n.status)
    )

    if (existingNegotiation) {
      setActiveNegotiation(existingNegotiation)

      return existingNegotiation
    }

    // Create new negotiation
    const newNegotiation = {
      id: `neg_${Date.now()}`,
      productId,
      initialPrice,
      currentPrice: initialPrice,
      proposedPrice,
      status: "pending", // pending, accepted, rejected, counter_offered, completed
      history: [
        {
          price: proposedPrice,
          timestamp: new Date().toISOString(),
          party: "customer",
          message: "Initial offer",
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setNegotiations((prev) => [...prev, newNegotiation])
    setActiveNegotiation(newNegotiation)

    return newNegotiation
  }

  // Update an existing negotiation
  const updateNegotiation = (negotiationId, updates) => {
    setNegotiations((prev) =>
      prev.map((negotiation) => {
        if (negotiation.id === negotiationId) {
          const updatedNegotiation = {
            ...negotiation,
            ...updates,
            updatedAt: new Date().toISOString(),
          }

          // If this is the active negotiation, update it
          if (activeNegotiation && activeNegotiation.id === negotiationId) {
            setActiveNegotiation(updatedNegotiation)
          }

          return updatedNegotiation
        }

        return negotiation
      })
    )
  }

  // Add a message to negotiation history
  const addNegotiationMessage = (negotiationId, price, party, message) => {
    setNegotiations((prev) =>
      prev.map((negotiation) => {
        if (negotiation.id === negotiationId) {
          const updatedNegotiation = {
            ...negotiation,
            history: [
              ...negotiation.history,
              {
                price,
                timestamp: new Date().toISOString(),
                party,
                message,
              },
            ],
            updatedAt: new Date().toISOString(),
          }

          // If this is the active negotiation, update it
          if (activeNegotiation && activeNegotiation.id === negotiationId) {
            setActiveNegotiation(updatedNegotiation)
          }

          return updatedNegotiation
        }

        return negotiation
      })
    )
  }

  // Accept a negotiation (seller accepts buyer's offer)
  const acceptNegotiation = (negotiationId) => {
    setNegotiations((prev) =>
      prev.map((negotiation) => {
        if (negotiation.id === negotiationId) {
          const lastOffer = negotiation.history[negotiation.history.length - 1]

          const updatedNegotiation = {
            ...negotiation,
            status: "accepted",
            currentPrice: lastOffer.price,
            updatedAt: new Date().toISOString(),
            history: [
              ...negotiation.history,
              {
                price: lastOffer.price,
                timestamp: new Date().toISOString(),
                party: "seller",
                message: "Offer accepted",
              },
            ],
          }

          // If this is the active negotiation, update it
          if (activeNegotiation && activeNegotiation.id === negotiationId) {
            setActiveNegotiation(updatedNegotiation)
          }

          return updatedNegotiation
        }

        return negotiation
      })
    )
  }

  // Reject a negotiation
  const rejectNegotiation = (negotiationId) => {
    setNegotiations((prev) =>
      prev.map((negotiation) => {
        if (negotiation.id === negotiationId) {
          const updatedNegotiation = {
            ...negotiation,
            status: "rejected",
            updatedAt: new Date().toISOString(),
            history: [
              ...negotiation.history,
              {
                price: negotiation.currentPrice,
                timestamp: new Date().toISOString(),
                party: "seller",
                message: "Offer rejected",
              },
            ],
          }

          // If this is the active negotiation, update it
          if (activeNegotiation && activeNegotiation.id === negotiationId) {
            setActiveNegotiation(updatedNegotiation)
          }

          return updatedNegotiation
        }

        return negotiation
      })
    )
  }

  // Counter offer (seller proposes a different price)
  const counterOffer = (negotiationId, counterPrice, message = "Counter offer") => {
    setNegotiations((prev) =>
      prev.map((negotiation) => {
        if (negotiation.id === negotiationId) {
          const updatedNegotiation = {
            ...negotiation,
            status: "counter_offered",
            currentPrice: counterPrice,
            updatedAt: new Date().toISOString(),
            history: [
              ...negotiation.history,
              {
                price: counterPrice,
                timestamp: new Date().toISOString(),
                party: "seller",
                message,
              },
            ],
          }

          // If this is the active negotiation, update it
          if (activeNegotiation && activeNegotiation.id === negotiationId) {
            setActiveNegotiation(updatedNegotiation)
          }

          return updatedNegotiation
        }

        return negotiation
      })
    )
  }

  // Complete a negotiation (convert to order)
  const completeNegotiation = (negotiationId) => {
    setNegotiations((prev) =>
      prev.map((negotiation) => {
        if (negotiation.id === negotiationId) {
          const updatedNegotiation = {
            ...negotiation,
            status: "completed",
            updatedAt: new Date().toISOString(),
            history: [
              ...negotiation.history,
              {
                price: negotiation.currentPrice,
                timestamp: new Date().toISOString(),
                party: "system",
                message: "Negotiation completed and converted to order",
              },
            ],
          }

          // If this is the active negotiation, update it
          if (activeNegotiation && activeNegotiation.id === negotiationId) {
            setActiveNegotiation(updatedNegotiation)
          }

          return updatedNegotiation
        }

        return negotiation
      })
    )
  }

  // Get negotiation by product ID
  const getNegotiationByProductId = (productId) => {
    return negotiations.find((n) => n.productId === productId && ["pending", "counter_offered", "accepted"].includes(n.status))
  }

  return (
    <NegotiationContext.Provider
      value={{
        negotiations,
        activeNegotiation,
        setActiveNegotiation,
        startNegotiation,
        updateNegotiation,
        addNegotiationMessage,
        acceptNegotiation,
        rejectNegotiation,
        counterOffer,
        completeNegotiation,
        getNegotiationByProductId,
      }}
    >
      {children}
    </NegotiationContext.Provider>
  )
}

// Custom hook to use the negotiation context
export const useNegotiation = () => {
  const context = useContext(NegotiationContext)

  if (!context) {
    throw new Error("useNegotiation must be used within a NegotiationProvider")
  }

  return context
}
