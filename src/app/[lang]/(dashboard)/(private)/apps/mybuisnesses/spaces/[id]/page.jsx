'use client'

// Next Imports
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamically import components
const SpaceDetailView = dynamic(() => import('@/views/apps/mybuisnesses/MyServices/SpaceDetails'), {
  ssr: false
})

const SpaceDetailsPage = () => {
  const params = useParams()

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <SpaceDetailView id={params.id} />
    </div>
  )
}

export default SpaceDetailsPage
