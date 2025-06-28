'use client'

import { useState } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Divider,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stepper,
  Step,
  StepLabel,
  Alert,
  InputAdornment,
  CircularProgress
} from '@mui/material'
import { CreditCard, Truck, Home, Check } from 'lucide-react'

import { useOrder } from '@/components/contexts/OrderContext'
import { useNegotiation } from '@/components/contexts/NegotiationContext'
import apiClient from '@/libs/api'

const OrderDialog = ({ open, onClose, product, negotiationId = null }) => {
  const { createOrder } = useOrder()
  const { getNegotiationByProductId, completeNegotiation } = useNegotiation()

  const [activeStep, setActiveStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState(null)

  const [orderDetails, setOrderDetails] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    wilayaId: 1,
    communeId: 1,
    paymentMethod: 'credit_card',
    shippingMethod: 'standard',
    quantity: 1
  })

  const [errors, setErrors] = useState({})

  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState(null)

  // Get negotiation if negotiationId is provided
  const negotiation = negotiationId ? getNegotiationByProductId(product.id) : null

  // Calculate price based on negotiation
  const price = negotiation && negotiation.status === 'accepted' ? negotiation.currentPrice : product.price

  // Calculate total
  const subtotal = price * orderDetails.quantity
  const shippingCost = orderDetails.shippingMethod === 'express' ? 15 : 5
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shippingCost + tax

  const handleChange = e => {
    const { name, value } = e.target

    setOrderDetails(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateStep = () => {
    const newErrors = {}

    if (activeStep === 0) {
      if (!orderDetails.fullName) newErrors.fullName = 'Full name is required'
      if (!orderDetails.phoneNumber) newErrors.phoneNumber = 'Phone number is required'
    } else if (activeStep === 1) {
      if (!orderDetails.address) newErrors.address = 'Address is required'
      if (!orderDetails.wilayaId) newErrors.wilayaId = 'Wilaya is required'
      if (!orderDetails.communeId) newErrors.communeId = 'Commune is required'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep(prev => prev - 1)
  }

  const handleSubmitOrder = async () => {
    if (!validateStep()) return

    setIsSubmitting(true)
    setApiError(null)

    try {
      // Use the buy-now API endpoint
      const response = await apiClient.post('/orders/buy-now', {
        product_id: product.id,
        quantity: orderDetails.quantity,
        full_name: orderDetails.fullName,
        phone_number: orderDetails.phoneNumber,
        address: orderDetails.address,
        wilaya_id: orderDetails.wilayaId,
        commune_id: orderDetails.communeId
      })

      console.log('Buy now response:', response.data)

      // Create local order record
      const orderData = {
        id: response.data.order_id,
        productId: product.id,
        productTitle: product.name,
        productImage: product.pictures?.[0]?.picture || '',
        quantity: orderDetails.quantity,
        unitPrice: price,
        subtotal,
        shippingCost,
        tax,
        total,
        customer: {
          fullName: orderDetails.fullName,
          phoneNumber: orderDetails.phoneNumber
        },
        shippingAddress: {
          address: orderDetails.address,
          wilayaId: orderDetails.wilayaId,
          communeId: orderDetails.communeId
        },
        paymentMethod: orderDetails.paymentMethod,
        shippingMethod: orderDetails.shippingMethod,
        negotiationId: negotiation?.id || null
      }

      const newOrder = createOrder(orderData)

      setOrderId(response.data.order_id)

      // If this order came from a negotiation, mark it as completed
      if (negotiation) {
        completeNegotiation(negotiation.id)
      }

      setOrderComplete(true)
      setActiveStep(3)
    } catch (error) {
      console.error('Error placing order:', error.response?.data || error.message)
      setApiError(error.response?.data?.message || 'Failed to place order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = ['Customer Information', 'Shipping Address', 'Review & Payment']

  const renderStepContent = step => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label='Full Name'
                name='fullName'
                value={orderDetails.fullName}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.fullName}
                helperText={errors.fullName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label='Phone Number'
                name='phoneNumber'
                value={orderDetails.phoneNumber}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label='Quantity'
                name='quantity'
                type='number'
                value={orderDetails.quantity}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  inputProps: { min: 1, max: product.quantity || 999 }
                }}
              />
            </Grid>
          </Grid>
        )
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label='Address'
                name='address'
                value={orderDetails.address}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.address}
                helperText={errors.address}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label='Wilaya ID'
                name='wilayaId'
                type='number'
                value={orderDetails.wilayaId}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.wilayaId}
                helperText={errors.wilayaId}
                InputProps={{
                  inputProps: { min: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label='Commune ID'
                name='communeId'
                type='number'
                value={orderDetails.communeId}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.communeId}
                helperText={errors.communeId}
                InputProps={{
                  inputProps: { min: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component='fieldset'>
                <FormLabel component='legend'>Shipping Method</FormLabel>
                <RadioGroup name='shippingMethod' value={orderDetails.shippingMethod} onChange={handleChange}>
                  <FormControlLabel
                    value='standard'
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Truck size={18} style={{ marginRight: 8 }} />
                        <Box>
                          <Typography variant='body1'>Standard Shipping</Typography>
                          <Typography variant='body2' color='text.secondary'>
                            Delivery in 3-5 business days
                          </Typography>
                        </Box>
                        <Typography variant='body1' sx={{ ml: 'auto' }}>
                          $5.00
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value='express'
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Truck size={18} style={{ marginRight: 8 }} />
                        <Box>
                          <Typography variant='body1'>Express Shipping</Typography>
                          <Typography variant='body2' color='text.secondary'>
                            Delivery in 1-2 business days
                          </Typography>
                        </Box>
                        <Typography variant='body1' sx={{ ml: 'auto' }}>
                          $15.00
                        </Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        )
      case 2:
        return (
          <Box>
            {apiError && (
              <Alert severity='error' sx={{ mb: 3 }}>
                {apiError}
              </Alert>
            )}
            <Typography variant='h6' sx={{ mb: 2 }}>
              Order Summary
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant='body2'>Product:</Typography>
                <Typography variant='body2'>{product.name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant='body2'>Price:</Typography>
                <Typography variant='body2'>${price.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant='body2'>Quantity:</Typography>
                <Typography variant='body2'>{orderDetails.quantity}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant='body2'>Subtotal:</Typography>
                <Typography variant='body2'>${subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant='body2'>Shipping:</Typography>
                <Typography variant='body2'>${shippingCost.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant='body2'>Tax:</Typography>
                <Typography variant='body2'>${tax.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant='subtitle1' fontWeight='bold'>
                  Total:
                </Typography>
                <Typography variant='subtitle1' fontWeight='bold'>
                  ${total.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Typography variant='h6' sx={{ mb: 2 }}>
              Shipping Information
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant='body2'>
                <strong>Name:</strong> {orderDetails.fullName}
              </Typography>
              <Typography variant='body2'>
                <strong>Phone:</strong> {orderDetails.phoneNumber}
              </Typography>
              <Typography variant='body2'>
                <strong>Address:</strong> {orderDetails.address}
              </Typography>
              <Typography variant='body2'>
                <strong>Wilaya ID:</strong> {orderDetails.wilayaId}
              </Typography>
              <Typography variant='body2'>
                <strong>Commune ID:</strong> {orderDetails.communeId}
              </Typography>
            </Box>

            <Typography variant='h6' sx={{ mb: 2 }}>
              Payment Method
            </Typography>
            <FormControl component='fieldset'>
              <RadioGroup name='paymentMethod' value={orderDetails.paymentMethod} onChange={handleChange}>
                <FormControlLabel
                  value='credit_card'
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CreditCard size={18} style={{ marginRight: 8 }} />
                      <Typography>Credit/Debit Card</Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value='cash_on_delivery'
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Home size={18} style={{ marginRight: 8 }} />
                      <Typography>Cash on Delivery</Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Box>
        )
      case 3:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Check size={60} color='green' style={{ marginBottom: 16 }} />
            <Typography variant='h5' gutterBottom>
              Order Placed Successfully!
            </Typography>
            <Typography variant='body1' paragraph>
              Your order #{orderId} has been placed successfully.
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              You will receive an email confirmation shortly.
            </Typography>
            <Button variant='contained' onClick={onClose}>
              Close
            </Button>
          </Box>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onClose={orderComplete ? onClose : undefined} maxWidth='md' fullWidth>
      <DialogTitle>{orderComplete ? 'Order Confirmation' : 'Place Order'}</DialogTitle>
      <DialogContent>
        {!orderComplete && (
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}
        {renderStepContent(activeStep)}
      </DialogContent>
      {!orderComplete && activeStep < steps.length && (
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          {activeStep > 0 && (
            <Button onClick={handleBack} disabled={isSubmitting}>
              Back
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button variant='contained' onClick={handleNext} disabled={isSubmitting}>
              Next
            </Button>
          ) : (
            <Button
              variant='contained'
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color='inherit' /> : null}
            >
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  )
}

export default OrderDialog
