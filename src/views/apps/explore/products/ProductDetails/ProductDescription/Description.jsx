'use client'

import { Card, Typography } from '@mui/material'

const Description = ({ product }) => {
  // Vérifier si la description existe, sinon afficher un message par défaut
  const description = product?.description || 'No description available for this product.'

  return (
    <Card sx={{ mb: 3, p: 3 }}>
      <Typography variant='body1' paragraph>
        {description}
      </Typography>
    </Card>
  )
}

export default Description
