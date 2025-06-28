"use client"

import { createContext, useState, useContext, useEffect } from "react"

// Create context
const OrderContext = createContext()

// Provider component
export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([])

  // Load orders from localStorage on initial render
  useEffect(() => {
    const storedOrders = localStorage.getItem("orders")

    if (storedOrders) {
      setOrders(JSON.parse(storedOrders))
    }
  }, [])

  // Save to localStorage whenever orders changes
  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders))
  }, [orders])

  // Create a new order
  const createOrder = (orderData) => {
    const newOrder = {
      id: `order_${Date.now()}`,
      ...orderData,
      status: "pending", // pending, processing, shipped, delivered, cancelled
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setOrders((prev) => [...prev, newOrder])

    return newOrder
  }

  // Update an existing order
  const updateOrder = (orderId, updates) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            ...updates,
            updatedAt: new Date().toISOString(),
          }
        }

        return order
      })
    )
  }

  // Cancel an order
  const cancelOrder = (orderId, reason = "Cancelled by customer") => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: "cancelled",
            cancellationReason: reason,
            updatedAt: new Date().toISOString(),
          }
        }

        return order
      })
    )
  }

  // Get order by ID
  const getOrderById = (orderId) => {
    return orders.find((order) => order.id === orderId)
  }

  // Get orders by product ID
  const getOrdersByProductId = (productId) => {
    return orders.filter((order) => order.productId === productId)
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        updateOrder,
        cancelOrder,
        getOrderById,
        getOrdersByProductId,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

// Custom hook to use the order context
export const useOrder = () => {
  const context = useContext(OrderContext)

  if (!context) {
    throw new Error("useOrder must be used within an OrderProvider")
  }

  return context
}
