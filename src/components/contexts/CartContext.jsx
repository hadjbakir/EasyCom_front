'use client'

import { createContext, useState, useContext, useEffect, useCallback } from 'react'

import { useSession } from 'next-auth/react'

import apiClient, { invalidateCache } from '@/libs/api'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [error, setError] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [orderIds, setOrderIds] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Use the useSession hook to get current authentication state
  const { data: session, status } = useSession()

  // Check authentication status whenever session changes
  useEffect(() => {
    const isLoggedIn = status === 'authenticated' && !!session?.user?.accessToken

    if (status === 'authenticated' && process.env.NODE_ENV === 'development') {
      console.log('Auth status check:', status, isLoggedIn ? 'Authenticated' : 'Not authenticated')
    }

    setIsAuthenticated(isLoggedIn)
  }, [session, status])

  const fetchCart = useCallback(async () => {
    // Don't fetch cart if not authenticated
    if (!isAuthenticated) {
      setCartItems([])
      setOrderIds([])
      setIsLoading(false)

      return
    }

    setIsLoading(true)

    try {
      console.log('Fetching cart')
      const response = await apiClient.get('/orders/cart')

      console.log('Cart fetch response:', JSON.stringify(response.data, null, 2))

      const allItems = []
      const orderIdsArray = []

      if (response.data.data && Array.isArray(response.data.data)) {
        // Process each order
        for (const order of response.data.data) {
          orderIdsArray.push(order.id)

          // Fetch supplier details if not included in the response
          let supplierName = order.supplier?.name || null

          if (order.supplier_id && !supplierName) {
            try {
              const supplierResponse = await apiClient.get(`/suppliers/${order.supplier_id}`)

              if (supplierResponse.data?.data) {
                supplierName =
                  supplierResponse.data.data.business_name ||
                  supplierResponse.data.data.user?.full_name ||
                  `Supplier #${order.supplier_id}`
              }
            } catch (err) {
              console.warn(`Failed to fetch supplier #${order.supplier_id} details:`, err.message)
              supplierName = `Supplier #${order.supplier_id}`
            }
          }

          if (order.order_products && Array.isArray(order.order_products)) {
            order.order_products.forEach(item => {
              allItems.push({
                id: item.id,
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity || 1,
                price: parseFloat(item.unit_price || 0),
                negotiatedPrice: null,
                options: {},
                supplier_id: order.supplier_id,
                supplier_name: supplierName || 'Unknown Supplier',
                product: {
                  id: item.product?.id || item.product_id,
                  name: item.product?.name || 'Unknown Product',
                  supplier: {
                    id: order.supplier_id,
                    name: supplierName || 'Unknown Supplier'
                  },
                  pictures: Array.isArray(item.product?.pictures)
                    ? item.product.pictures.map(pic => ({
                        id: pic.id,
                        picture: pic.picture
                      }))
                    : []
                }
              })
            })
          }
        }
      }

      console.log('Normalized cartItems:', JSON.stringify(allItems, null, 2))
      setCartItems(allItems)
      setOrderIds(orderIdsArray)
      console.log('Set orderIds:', orderIdsArray)
      setError(null)
    } catch (err) {
      console.error('Détails erreur API /orders/cart:', err.response?.data || err.message)

      if (err.response?.status === 401) {
        // User is not authenticated, silently handle this case
        console.log('User not authenticated, cart will be empty')
        setIsAuthenticated(false)
        setCartItems([])
        setOrderIds([])
        setError(null)
      } else if (err.response?.status === 404) {
        console.log('Panier vide détecté, définition de cartItems à [] et orderIds à []')
        setCartItems([])
        setOrderIds([])
        setError(null)
      } else {
        setError(err.response?.data?.message || 'Erreur lors du chargement du panier')
        setCartItems([])
        setOrderIds([])
      }
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  // Fetch cart data when authentication status changes
  useEffect(() => {
    if (status !== 'authenticated') {
      setCartItems([])
      setOrderIds([])
      setIsLoading(false)

      return
    }

    fetchCart()
  }, [fetchCart, isAuthenticated, status])

  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (!isAuthenticated) {
        setError('Please log in to add items to your cart')

        return
      }

      if (isAdding) {
        console.log('addToCart bloqué: ajout en cours')

        return
      }

      setIsAdding(true)

      try {
        console.log(`Tentative d'ajout du produit ${product.id} au panier avec quantité=${quantity}`)

        const response = await apiClient.post('/orders/add-to-cart', {
          product_id: product.id,
          quantity
        })

        console.log(
          `Produit ${product.id} ajouté au panier, order_id: ${response.data.order_id}, quantité demandée: ${quantity}`
        )

        invalidateCache('/orders/cart')

        if (response.data.order_id && !orderIds.includes(response.data.order_id)) {
          setOrderIds(prev => [...prev, response.data.order_id])
        }

        await fetchCart()
      } catch (error) {
        console.error("Erreur lors de l'ajout au panier:", error.response?.data || error.message)
        setError(error.response?.data?.message || "Erreur lors de l'ajout au panier")
      } finally {
        setIsAdding(false)
      }
    },
    [fetchCart, isAdding, orderIds, isAuthenticated]
  )

  const removeFromCart = useCallback(
    async productId => {
      if (!isAuthenticated) {
        return
      }

      try {
        // Ensure productId is properly formatted
        const formattedProductId = String(productId).trim()

        console.log(`Tentative de suppression du produit avec product_id=${formattedProductId}`)

        // Find the item in the cart to get its order_id
        const item = cartItems.find(item => String(item.product_id) === formattedProductId)

        if (!item) {
          console.log(`Product with ID ${formattedProductId} not found in local cart state, refreshing cart`)
          await fetchCart()

          return
        }

        console.log(`Found item in cart:`, JSON.stringify(item, null, 2))

        // Try to remove the product using a custom approach that includes the order_id
        try {
          // First try with a custom endpoint that includes order_id in the query string
          const response = await apiClient.delete(`/orders/cart/remove/${formattedProductId}?order_id=${item.order_id}`)

          console.log(`Produit supprimé avec succès (avec order_id), response:`, response.data)
        } catch (firstError) {
          console.log('First removal method failed, trying standard endpoint:', firstError.message)

          // Fall back to the standard endpoint if the custom one fails
          const response = await apiClient.delete(`/orders/cart/remove/${formattedProductId}`)

          console.log(`Produit supprimé avec succès (sans order_id), response:`, response.data)
        }

        invalidateCache('/orders/cart')

        // Refresh cart after successful deletion
        await fetchCart()
      } catch (error) {
        console.error('Erreur lors de la suppression du panier:', error)

        // If the product was not found in the cart on the server, just refresh the cart
        if (
          error.response?.status === 404 &&
          (error.response?.data?.message === 'Product not found in cart' ||
            error.response?.data?.message === 'Cart not found')
        ) {
          console.log('Product or cart not found on server, refreshing local cart state')
          await fetchCart()

          return
        }

        // More detailed error logging for other errors
        if (error.response) {
          console.error('Response data:', error.response.data)
          console.error('Response status:', error.response.status)
          console.error('Response headers:', error.response.headers)
          setError(error.response.data?.message || 'Erreur lors de la suppression du panier')
        } else if (error.request) {
          console.error('No response received:', error.request)
          setError('Aucune réponse reçue du serveur')
        } else {
          console.error('Error message:', error.message)
          setError(error.message || 'Erreur lors de la suppression du panier')
        }
      }
    },
    [fetchCart, isAuthenticated, cartItems]
  )

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (!isAuthenticated) {
        return
      }

      try {
        const item = cartItems.find(item => item.product_id === productId)

        if (!item) {
          throw new Error('Product not found in cart')
        }

        console.log(
          `Mise à jour de la quantité pour product_id=${productId} à ${quantity} dans order_id=${item.order_id}`
        )
        await apiClient.put('/orders/cart/update', {
          order_id: item.order_id,
          product_id: productId,
          quantity
        })
        console.log(`Quantité mise à jour pour product_id=${productId}`)
        await fetchCart()
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la quantité:', error.response?.data || error.message)
        setError(error.response?.data?.message || 'Erreur lors de la mise à jour de la quantité')
      }
    },
    [fetchCart, cartItems, isAuthenticated]
  )

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0)
  }

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price || 0

      return total + price * (item.quantity || 0)
    }, 0)
  }

  const validateCart = async (shippingInfo = {}) => {
    if (!isAuthenticated) {
      setError('Please log in to proceed with checkout')

      return false
    }

    console.log('Tentative de validation du panier avec orderIds=', orderIds, 'shippingInfo=', shippingInfo)

    if (!orderIds.length) {
      console.log('Validation annulée: aucun orderIds disponible')
      setError('Aucun panier à valider')

      return false
    }

    try {
      console.log(`Envoi de la requête PUT /orders/validate-cart avec shippingInfo`)

      const response = await apiClient.put(`/orders/validate-cart`, {
        full_name: shippingInfo.full_name || shippingInfo.fullName,
        phone_number: shippingInfo.phone_number || shippingInfo.phoneNumber,
        address: shippingInfo.address,
        wilaya_id: shippingInfo.wilaya_id || 1,
        commune_id: shippingInfo.commune_id || 1
      })

      console.log('Validation réussie:', JSON.stringify(response.data, null, 2))
      await fetchCart()

      return response.data
    } catch (error) {
      console.error('Erreur lors de la validation du panier:', error.response?.data || error.message)
      setError(error.response?.data?.message || 'Erreur lors de la validation du panier')

      return false
    }
  }

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      return
    }

    try {
      await apiClient.delete('/orders/cart/clear')
      console.log('Cart cleared successfully')
      setCartItems([])
      setOrderIds([])
      setError(null)
    } catch (error) {
      // Si l'erreur est "No active cart to clear", c'est normal - le panier est déjà vide
      if (error.response?.status === 404 && error.response?.data?.message === 'No active cart to clear') {
        console.log("Panier déjà vide, mise à jour de l'état local")
        setCartItems([])
        setOrderIds([])
        setError(null)

        return
      }

      console.error('Erreur lors de la suppression du panier:', error.response?.data || error.message)
      setError(error.response?.data?.message || 'Erreur lors de la suppression du panier')
    }
  }, [isAuthenticated])

  const retryCartFetch = () => {
    if (isAuthenticated) {
      fetchCart()
    }
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalItems,
        getSubtotal,
        validateCart,
        clearCart,
        error,
        retryCartFetch,
        isAdding,
        isLoading,
        orderIds,
        isAuthenticated
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }

  return context
}
