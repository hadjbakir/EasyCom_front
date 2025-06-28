"use client"

import { Box, CardMedia, Grid } from "@mui/material"

const ImagesTab = ({ space }) => {
  // Log incoming space data for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.log("ImagesesTab received space:", {
      id: space.id,
      business_name: space.business_name,
      type: space.type,
      images: space.images,
      address: space.address,
      location: space.location,
      phone_number: space.phone_number,
      email: space.email,
      is_active: space.is_active,
      studio: space.studio,
      coworking: space.coworking
    })
  }

  // Use images array, fallback to single default image
  const images = Array.isArray(space.images) && space.images.length > 0
    ? space.images
    : ["/images/spaces/default.png"]

  return (
    <Box>
      <Grid container spacing={2}>
        {images.map((image, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <CardMedia
              component="img"
              height="200"
              image={image}
              alt={`${space.business_name || "Space"} image ${index + 1}`}
              sx={{
                borderRadius: 1,
                objectFit: 'cover',
                width: '100%'
              }}
              onError={(e) => {
                console.error(`Failed to load image: ${image}`, e)
                e.target.src = "/images/spaces/default.png"
              }}
              onLoad={() => console.log(`Successfully loaded image: ${image}`)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default ImagesTab
