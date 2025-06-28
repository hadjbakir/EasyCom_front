'use client'

import { useState } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material'

import { useNegotiation } from '@/components/contexts/NegotiationContext'

const NegotiationDialog = ({ open, onClose, product }) => {
  const { startNegotiation, getNegotiationByProductId } = useNegotiation()
  const [proposedPrice, setProposedPrice] = useState('')
  const [error, setError] = useState('')
  const negotiation = getNegotiationByProductId(product?.id)

  // Convertir product.price en nombre
  const productPrice = parseFloat(product?.price) || 0

  const handleProposePrice = () => {
    const price = parseFloat(proposedPrice)

    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price')

      return
    }

    if (price >= productPrice) {
      setError('Proposed price must be lower than the current price')

      return
    }

    startNegotiation(product.id, productPrice, price)
    setProposedPrice('')
    setError('')
    onClose()
  }

  console.log('NegotiationDialog product.price:', product?.price)

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Negotiate Price for {product?.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant='body1'>Current Price: ${productPrice.toFixed(2)}</Typography>
          {negotiation && (
            <Typography variant='body2' color='text.secondary'>
              Your last proposed price: ${parseFloat(negotiation.currentPrice).toFixed(2)}
            </Typography>
          )}
        </Box>
        {!negotiation ? (
          <>
            <TextField
              label='Your Proposed Price'
              type='number'
              fullWidth
              value={proposedPrice}
              onChange={e => setProposedPrice(e.target.value)}
              sx={{ mb: 2 }}
              inputProps={{ step: '0.01', min: '0' }}
            />
            {error && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </>
        ) : (
          <Alert severity={negotiation.status === 'accepted' ? 'success' : 'info'}>
            {negotiation.status === 'accepted'
              ? `Your price of $${parseFloat(negotiation.currentPrice).toFixed(2)} was accepted!`
              : 'Your negotiation is pending. Please wait for the supplier response.'}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {!negotiation && (
          <Button variant='contained' onClick={handleProposePrice} disabled={!proposedPrice}>
            Submit Proposal
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default NegotiationDialog
