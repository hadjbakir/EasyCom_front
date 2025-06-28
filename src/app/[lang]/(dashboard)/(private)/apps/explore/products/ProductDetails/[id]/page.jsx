'use client'

import { useState, useEffect } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

import { Typography } from '@mui/material'

import apiClient from '@/libs/api'
import ProductDetails from '@views/apps/explore/products/ProductDetails'

const ProductDetaillePage = () => {
  const { id } = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProduct = async () => {
      console.log('Session status:', status)
      console.log('Session token:', session?.user?.accessToken)

      try {
        setIsLoading(true)
        const response = await apiClient.get(`/products/${id}`)

        console.log('API response:', response.data.data)
        console.log('Product images:', response.data.data.images || 'No images available')
        console.log('Product pictures:', response.data.data.pictures || 'No pictures available')
        setProduct(response.data.data)
      } catch (err) {
        console.error('Error fetching product:', err)

        if (err.response?.status === 401) {
          setError('Please log in to view product details')
          router.push('/login')
        } else {
          setError('Failed to load product')
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (id && status !== 'loading') {
      if (status === 'unauthenticated') {
        setError('Please log in to view product details')
        router.push('/login')
      } else {
        fetchProduct()
      }
    }
  }, [id, status, session, router])

  if (isLoading) return <Typography>Loading...</Typography>
  if (error) return <Typography color='error'>{error}</Typography>
  if (!product) return <Typography>Product not found</Typography>

  return <ProductDetails product={product} />
}

export default ProductDetaillePage
