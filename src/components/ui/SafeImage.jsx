'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Box } from '@mui/material'
import { buildImageUrl, getFallbackImage } from '@/utils/imageUtils'

const SafeImage = ({
  src,
  alt,
  type = 'default',
  fallback = null,
  width,
  height,
  fill = false,
  style = {},
  className = '',
  priority = false,
  ...props
}) => {
  const [imageError, setImageError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)

  const handleError = () => {
    console.warn(`Image failed to load: ${imageSrc}`)
    setImageError(true)

    // Try fallback image
    const fallbackSrc = fallback || getFallbackImage(type)
    if (fallbackSrc !== imageSrc) {
      setImageSrc(fallbackSrc)
      setImageError(false)
    }
  }

  const handleLoad = () => {
    setImageError(false)
  }

  // Build the image URL
  const finalSrc = buildImageUrl(imageSrc, type) || imageSrc

  return (
    <Box
      sx={{
        position: 'relative',
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
        backgroundColor: 'grey.100',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
      className={className}
    >
      <Image
        src={finalSrc}
        alt={alt || 'Image'}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        style={{
          objectFit: 'contain',
          ...style
        }}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        unoptimized={true} // Disable Next.js optimization for external images
        {...props}
      />

      {imageError && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'text.secondary',
            fontSize: '0.875rem'
          }}
        >
          Image not available
        </Box>
      )}
    </Box>
  )
}

export default SafeImage
