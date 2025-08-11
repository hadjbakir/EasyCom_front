'use client'

import { useState } from 'react'

import { Tabs, Tab, Box } from '@mui/material'

import SafeImage from '@/components/ui/SafeImage'
import { buildProductImageUrl } from '@/utils/imageUtils'

const ProductImage = ({ images }) => {
  const [selectedMedia, setSelectedMedia] = useState(0)

  // Log pour déboguer props.images
  console.log('ProductImage props.images:', images)

  // Préparer les éléments de média à partir des images de l'API, inspiré de EditProductDrawer
  const mediaItems =
    images?.length > 0
      ? images.map(image => {
          const src = buildProductImageUrl(image.picture)

          console.log('ProductImage mediaItem src:', src)

          return { type: 'image', src }
        })
      : [{ type: 'image', src: '/images/placeholder.jpg' }]

  return (
    <Box>
      {/* Main Product Image (on top) */}
      <Box
        sx={{
          position: 'relative',
          height: 400,
          width: '100%',
          mb: 2,
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <SafeImage
          src={mediaItems[selectedMedia].src}
          alt={`Product view ${selectedMedia + 1}`}
          fill
          type='product'
          priority
        />
      </Box>

      {/* Thumbnail Navigation */}
      <Tabs
        value={selectedMedia}
        onChange={(_, newValue) => setSelectedMedia(newValue)}
        variant='scrollable'
        scrollButtons='auto'
        sx={{
          '& .MuiTabs-indicator': {
            display: 'none'
          }
        }}
      >
        {mediaItems.map((item, i) => (
          <Tab
            key={i}
            value={i}
            icon={
              <Box
                sx={{
                  position: 'relative',
                  width: 80,
                  height: 80,
                  border: 1,
                  borderColor: i === selectedMedia ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                  backgroundColor: 'white'
                }}
              >
                <SafeImage src={item.src} alt={`Thumbnail ${i + 1}`} fill type='product' />
              </Box>
            }
          />
        ))}
      </Tabs>
    </Box>
  )
}

export default ProductImage
