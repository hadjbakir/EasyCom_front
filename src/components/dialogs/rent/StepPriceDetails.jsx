// MUI Imports
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import InputAdornment from '@mui/material/InputAdornment'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import MenuItem from '@mui/material/MenuItem'
import Radio from '@mui/material/Radio'
import FormControlLabel from '@mui/material/FormControlLabel'
import RadioGroup from '@mui/material/RadioGroup'
import Checkbox from '@mui/material/Checkbox'

import CustomTextField from '@core/components/mui/TextField'

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'

const StepPriceDetails = ({ activeStep, isLastStep, handleNext, handlePrev }) => {
  return (
    <Grid className='flex flex-col gap-6'>
      <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6 }}>
        <CustomTextField
          fullWidth
          type='number'
          placeholder='1000'
          label='Price per Hour'
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <i className='tabler-currency-dollar' />
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
          placeholder='4500'
          label='Price Per Day'
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <i className='tabler-currency-dollar' />
                </InputAdornment>
              )
            }
          }}
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
              <i className='tablerr-check' />
            ) : (
              <DirectionalIcon ltrIconClass='tabler-arrow-right' rtlIconClass='tabler-arrow-left' />
            )
          }
        >
          {isLastStep ? 'Submit' : 'Next'}
        </Button>
        </Grid>
      </Grid>
      </Grid>
  )
}

export default StepPriceDetails
