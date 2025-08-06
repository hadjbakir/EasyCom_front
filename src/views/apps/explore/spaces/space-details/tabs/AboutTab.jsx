'use client'

import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Chip,
  TableContainer,
  Paper,
  TableBody
} from '@mui/material'
import { MapPin, Info, Building2, DollarSign, Users, Check, Calendar, X } from 'lucide-react'

const AboutTab = ({ space }) => {
  // Log space data for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.log('AboutTab received space:', {
      id: space.id,
      type: space.type,
      description: space.description,
      address: space.address,
      email: space.email,
      phone_number: space.phone_number,
      availability: space.availability
    })
  }

  // Capitalize day names for display
  const capitalizeDay = day => {
    if (!day) return ''

    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
  }

  return (
    <Grid container spacing={4}>
      {/* Description Section */}
      <Grid item xs={12}>
        <Card
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box display='flex' alignItems='center' gap={2} mb={3}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Info size={20} />
              </Box>
              <Typography variant='h5' fontWeight='600'>
                About This Space
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Typography variant='body1' color='text.secondary' sx={{ lineHeight: 1.8 }}>
              {space.description || 'No description available.'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Key Information Section */}
      <Grid item xs={12} md={6}>
        <Card
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            height: '100%',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box display='flex' alignItems='center' gap={2} mb={3}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Building2 size={20} />
              </Box>
              <Typography variant='h5' fontWeight='600'>
                Key Information
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box display='flex' flexDirection='column' gap={4}>
              {/* Location */}
              <Box display='flex' alignItems='flex-start' gap={3}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'primary.lighter',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <MapPin size={18} />
                </Box>
                <Box>
                  <Typography variant='subtitle1' fontWeight='600' color='text.primary'>
                    Location
                  </Typography>
                  <Typography variant='body2' color='text.secondary' mt={0.5}>
                    {space.address || 'No address available'}
                  </Typography>
                </Box>
              </Box>

              {/* Contact */}
              <Box display='flex' alignItems='flex-start' gap={3}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'primary.lighter',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <MapPin size={18} />
                </Box>
                <Box>
                  <Typography variant='subtitle1' fontWeight='600' color='text.primary'>
                    Contact
                  </Typography>
                  <Typography variant='body2' color='text.secondary' mt={0.5}>
                    {space.email || 'No email available'}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {space.phone_number || 'No phone number available'}
                  </Typography>
                </Box>
              </Box>

              {/* Pricing */}
              <Box display='flex' alignItems='flex-start' gap={3}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'primary.lighter',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <DollarSign size={18} />
                </Box>
                <Box>
                  <Typography variant='subtitle1' fontWeight='600' color='text.primary'>
                    Pricing
                  </Typography>
                  {space.type === 'studio' ? (
                    <>
                      <Typography variant='body2' color='text.secondary' mt={0.5}>
                        Hourly Rate: {space.studio?.price_per_hour ? `$${space.studio.price_per_hour}/hour` : 'N/A'}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Daily Rate: {space.studio?.price_per_day ? `$${space.studio.price_per_day}/day` : 'N/A'}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant='body2' color='text.secondary' mt={0.5}>
                        Daily Rate: {space.coworking?.price_per_day ? `$${space.coworking.price_per_day}/day` : 'N/A'}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Monthly Rate:{' '}
                        {space.coworking?.price_per_month ? `$${space.coworking.price_per_month}/month` : 'N/A'}
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>

              {/* Type-Specific Details */}
              {space.type === 'studio' && space.studio?.services?.length > 0 && (
                <Box display='flex' alignItems='flex-start' gap={3}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'primary.lighter',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Check size={18} />
                  </Box>
                  <Box>
                    <Typography variant='subtitle1' fontWeight='600' color='text.primary'>
                      Services
                    </Typography>
                    {space.studio.services.map((service, index) => (
                      <Typography key={index} variant='body2' color='text.secondary' mt={0.5}>
                        {service.label || 'N/A'}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
              {space.type === 'coworking' && space.coworking && (
                <>
                  {space.coworking.seating_capacity && (
                    <Box display='flex' alignItems='flex-start' gap={3}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          bgcolor: 'primary.lighter',
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Users size={18} />
                      </Box>
                      <Box>
                        <Typography variant='subtitle1' fontWeight='600' color='text.primary'>
                          Seating Capacity
                        </Typography>
                        <Typography variant='body2' color='text.secondary' mt={0.5}>
                          {space.coworking.seating_capacity} seats
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  {space.coworking.meeting_rooms && (
                    <Box display='flex' alignItems='flex-start' gap={3}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          bgcolor: 'primary.lighter',
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Check size={18} />
                      </Box>
                      <Box>
                        <Typography variant='subtitle1' fontWeight='600' color='text.primary'>
                          Meeting Rooms
                        </Typography>
                        <Typography variant='body2' color='text.secondary' mt={0.5}>
                          {space.coworking.meeting_rooms} rooms
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Business Hours Section */}
      <Grid item xs={12} md={6}>
        <Card
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            height: '100%',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box display='flex' alignItems='center' gap={2} mb={3}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Calendar size={20} />
              </Box>
              <Typography variant='h5' fontWeight='600'>
                Business Hours
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            {Object.keys(space.availability || {}).length === 0 ? (
              <Typography color='text.secondary'>No working hours available.</Typography>
            ) : (
              <TableContainer
                component={Paper}
                variant='outlined'
                sx={{
                  borderRadius: 2,
                  '& .MuiTableCell-root': {
                    py: 2
                  }
                }}
              >
                <Table size='medium'>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Day</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Hours</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(space.availability || {}).map(([day, schedule]) => (
                      <TableRow key={day} hover>
                        <TableCell component='th' scope='row' sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                          {capitalizeDay(day)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={schedule.open ? 'Open' : 'Closed'}
                            color={schedule.open ? 'success' : 'default'}
                            size='small'
                            icon={schedule.open ? <Check size={14} /> : <X size={14} />}
                            sx={{
                              fontWeight: 500,
                              '& .MuiChip-icon': {
                                color: 'inherit'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: schedule.open ? 'text.primary' : 'text.disabled' }}>
                          {schedule.open ? schedule.hours : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AboutTab
