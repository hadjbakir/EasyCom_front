// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import DirectionalIcon from '@components/DirectionalIcon'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

const StepPropertyArea = ({ activeStep, isLastStep, handleNext, handlePrev }) => {
  // States


  const [date, setDate] = useState(null)


  return (
    <div className='flex flex-col gap-6'>
      <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6 }}>
        <CustomTextField
          fullWidth
          type='number'
          label='Total Area'
          placeholder='1000'
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end' className='text-textDisabled'>
                  sq-ft
                </InputAdornment>
              )
            }
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CustomTextField
          fullWidth
          type='number'
          label='Carpet Area'
          placeholder='800'
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end' className='text-textDisabled'>
                  sq-ft
                </InputAdornment>
              )
            }
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CustomTextField
          fullWidth
          type='number'
          label='Plot Area'
          placeholder='800'
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end' className='text-textDisabled'>
                  sq-yd
                </InputAdornment>
              )
            }
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <AppReactDatepicker
          selected={date}
          placeholderText='YYYY-MM-DD'
          dateFormat={'yyyy-MM-dd'}
          onChange={date => setDate(date)}
          customInput={<CustomTextField fullWidth label='Available From' />}
        />
      </Grid>



        <Grid size={{ xs: 12 }} className='flex items-center justify-between'>
          <Button
            variant='tonal'
            color='secondary'
            disabled={activeStep === 0}
            onClick={handlePrev}
            startIcon={<DirectionalIcon ltrIconClass='tabler-arrow-left' rtlIconClass='tabler-arrow-right' />}
          >
            Previous
          </Button>
          <Button
            variant='contained'
            color={isLastStep ? 'success' : 'primary'}
            onClick={handleNext}
            endIcon={
              isLastStep ? (
                <i className='tabler-check' />
              ) : (
                <DirectionalIcon ltrIconClass='tabler-arrow-right' rtlIconClass='tabler-arrow-left' />
              )
            }
          >
            {isLastStep ? 'Submit' : 'Next'}
          </Button>
        </Grid>
      </Grid>
    </div>
  )
}

export default StepPropertyArea
