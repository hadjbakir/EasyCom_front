'use client'

import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'

import { useSession } from 'next-auth/react'

// Dynamically import components
const StoreDetails = dynamic(() => import('@/views/apps/explore/stores/store-details'), {
  ssr: false
})

const StoreDetailsPage = () => {
  const params = useParams()
  const { data: session } = useSession()

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <StoreDetails id={params.id} user={session?.user} />
    </div>
  )
}

export default StoreDetailsPage
