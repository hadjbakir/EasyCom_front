"use client"

import { createContext, useState, useContext, useEffect } from "react"

// Create context
const ServiceOrderContext = createContext()

// Provider component
export const ServiceOrderProvider = ({ children }) => {
  const [serviceOrders, setServiceOrders] = useState([])
  const [activeOrder, setActiveOrder] = useState(null)

  // Load service orders from localStorage on initial render
  useEffect(() => {
    const storedOrders = localStorage.getItem("serviceOrders")
    
    if (storedOrders) {
      setServiceOrders(JSON.parse(storedOrders))
    }
  }, [])

  // Save to localStorage whenever serviceOrders changes
  useEffect(() => {
    localStorage.setItem("serviceOrders", JSON.stringify(serviceOrders))
  }, [serviceOrders])

  // Create a new service order
  const createOrder = (providerId, orderData) => {
    // Create new order
    const newOrder = {
      id: `order_${Date.now()}`,
      providerId,
      clientId: "current_user_id", // In a real app, get from auth context
      serviceType: orderData.serviceType,
      projectTitle: orderData.projectTitle,
      projectDescription: orderData.projectDescription,
      deliveryDate: orderData.deliveryDate,
      budget: orderData.budget,
      attachments: orderData.attachments || [],
      requirements: orderData.requirements || [],
      references: orderData.references || [],
      status: "pending", // pending, accepted, in_progress, revision, completed, cancelled
      messages: [
        {
          sender: "client",
          timestamp: new Date().toISOString(),
          content: orderData.initialMessage || "Initial service order",
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setServiceOrders((prev) => [...prev, newOrder])
    setActiveOrder(newOrder)

    return newOrder
  }

  // Update an existing service order
  const updateOrder = (orderId, updates) => {
    setServiceOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedOrder = {
            ...order,
            ...updates,
            updatedAt: new Date().toISOString(),
          }

          // If this is the active order, update it
          if (activeOrder && activeOrder.id === orderId) {
            setActiveOrder(updatedOrder)
          }

          return updatedOrder
        }


        return order
      }),
    )
  }

  // Add a message to order
  const addOrderMessage = (orderId, sender, content, attachments = []) => {
    setServiceOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedOrder = {
            ...order,
            messages: [
              ...order.messages,
              {
                sender,
                timestamp: new Date().toISOString(),
                content,
                attachments,
              },
            ],
            updatedAt: new Date().toISOString(),
          }

          // If this is the active order, update it
          if (activeOrder && activeOrder.id === orderId) {
            setActiveOrder(updatedOrder)
          }

          return updatedOrder
        }

        return order
      }),
    )
  }

  // Accept an order (provider accepts client's order)
  const acceptOrder = (orderId) => {
    setServiceOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedOrder = {
            ...order,
            status: "accepted",
            updatedAt: new Date().toISOString(),
            messages: [
              ...order.messages,
              {
                sender: "provider",
                timestamp: new Date().toISOString(),
                content: "Order accepted. Work will begin shortly.",
              },
            ],
          }

          // If this is the active order, update it
          if (activeOrder && activeOrder.id === orderId) {
            setActiveOrder(updatedOrder)
          }

          return updatedOrder
        }

        return order
      }),
    )
  }

  // Start work on an order
  const startOrder = (orderId) => {
    setServiceOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedOrder = {
            ...order,
            status: "in_progress",
            startedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: [
              ...order.messages,
              {
                sender: "provider",
                timestamp: new Date().toISOString(),
                content: "Work has started on your order.",
              },
            ],
          }

          // If this is the active order, update it
          if (activeOrder && activeOrder.id === orderId) {
            setActiveOrder(updatedOrder)
          }

          return updatedOrder
        }

        return order
      }),
    )
  }

  // Request revision for an order
  const requestRevision = (orderId, revisionDetails) => {
    setServiceOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedOrder = {
            ...order,
            status: "revision",
            updatedAt: new Date().toISOString(),
            revisionRequests: [
              ...(order.revisionRequests || []),
              {
                id: `rev_${Date.now()}`,
                details: revisionDetails,
                requestedAt: new Date().toISOString(),
                status: "pending",
              },
            ],
            messages: [
              ...order.messages,
              {
                sender: "client",
                timestamp: new Date().toISOString(),
                content: `Revision requested: ${revisionDetails}`,
              },
            ],
          }

          // If this is the active order, update it
          if (activeOrder && activeOrder.id === orderId) {
            setActiveOrder(updatedOrder)
          }

          return updatedOrder
        }

        return order
      }),
    )
  }

  // Complete an order
  const completeOrder = (orderId, deliverables = []) => {
    setServiceOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedOrder = {
            ...order,
            status: "completed",
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deliverables: deliverables,
            messages: [
              ...order.messages,
              {
                sender: "provider",
                timestamp: new Date().toISOString(),
                content: "Order has been completed and delivered.",
                attachments: deliverables,
              },
            ],
          }

          // If this is the active order, update it
          if (activeOrder && activeOrder.id === orderId) {
            setActiveOrder(updatedOrder)
          }

          return updatedOrder
        }

        return order
      }),
    )
  }

  // Cancel an order
  const cancelOrder = (orderId, reason) => {
    setServiceOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedOrder = {
            ...order,
            status: "cancelled",
            cancellationReason: reason,
            cancelledAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: [
              ...order.messages,
              {
                sender: "system",
                timestamp: new Date().toISOString(),
                content: `Order cancelled. Reason: ${reason}`,
              },
            ],
          }

          // If this is the active order, update it
          if (activeOrder && activeOrder.id === orderId) {
            setActiveOrder(updatedOrder)
          }

          return updatedOrder
        }

        return order
      }),
    )
  }

  // Get order by ID
  const getOrderById = (orderId) => {
    return serviceOrders.find((order) => order.id === orderId)
  }

  // Get orders by provider ID
  const getOrdersByProviderId = (providerId) => {
    return serviceOrders.filter((order) => order.providerId === providerId)
  }

  // Get orders by client ID
  const getOrdersByClientId = (clientId) => {
    return serviceOrders.filter((order) => order.clientId === clientId)
  }

  return (
    <ServiceOrderContext.Provider
      value={{
        serviceOrders,
        activeOrder,
        setActiveOrder,
        createOrder,
        updateOrder,
        addOrderMessage,
        acceptOrder,
        startOrder,
        requestRevision,
        completeOrder,
        cancelOrder,
        getOrderById,
        getOrdersByProviderId,
        getOrdersByClientId,
      }}
    >
      {children}
    </ServiceOrderContext.Provider>
  )
}

// Custom hook to use the service order context
export const useServiceOrder = () => {
  const context = useContext(ServiceOrderContext)

  if (!context) {
    throw new Error("useServiceOrder must be used within a ServiceOrderProvider")
  }

  return context
}

