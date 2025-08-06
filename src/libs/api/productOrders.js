import apiClient from '@/libs/api'

// Récupérer les ordres d'un client
export const getClientOrders = async userId => {
  const response = await apiClient.get(`/supplier-orders/user/${userId}`)

  return response.data
}

// Récupérer les ordres reçus par un supplier
export const getSupplierOrders = async supplierId => {
  const response = await apiClient.get(`/orders/supplier/${supplierId}`)

  return response.data
}

// Récupérer le détail d'un ordre
export const getOrderById = async orderId => {
  const response = await apiClient.get(`/supplier-orders/${orderId}`)

  return response.data
}

// Mettre à jour le statut d'un ordre
export const updateOrderStatus = async (orderId, status) => {
  const response = await apiClient.patch(`/orders/${orderId}/status`, { status })

  return response.data
}

// Récupérer les suppliers d'un user
export const getSuppliersByUser = async userId => {
  const response = await apiClient.get(`/suppliers/by-user/${userId}`)

  return response.data
}

// Recherche de produits similaires par image
export const searchProductsByImage = async imageFile => {
  const formData = new FormData()

  formData.append('image', imageFile)

  const response = await apiClient.post('/products/search', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return response.data
}

// Recherche de produits similaires par ID d'image
export const searchProductsByImageId = async imageId => {
  const response = await apiClient.post('/products/search-by-id', { id: imageId })

  return response.data
}

// Récupérer les infos d'un supplier/store par id
export const getSupplierById = async supplierId => {
  const response = await apiClient.get(`/suppliers/${supplierId}`)

  return response.data.data
}
