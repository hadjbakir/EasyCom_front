// React Imports
import { useState } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Radio from '@mui/material/Radio'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'

import CustomTextField from '@core/components/mui/TextField'
import CustomAutocomplete from '@core/components/mui/Autocomplete' // Adjust the path as needed

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import DirectionalIcon from '@components/DirectionalIcon'


const serviceoffreArray = [
  'AC',
  'TV',
  'RO',
  'Bed',
  'WiFi',
  'Sofa',
  'Fridge',
  'Cupboard',
  'Microwave',
  'Dining Table',
  'Washing Machine'
]

const StepPropertyDetails = ({ activeStep, isLastStep, handleNext, handlePrev }) => {
  // States
  const [value, setValue] = useState('react')

  const [serviceoffreDetails, setserviceoffreDetails] = useState(['Fridge', 'AC', 'TV'])




  const handleChange = event => {
    setValue(event.target.value)
  }

  return (
    <div className='flex flex-col gap-6'>
    <Grid container spacing={6}>

      <Grid size={{ xs: 12}}>
        <CustomTextField select fullWidth label='Property Type' id='validation-property-select' defaultValue=''>
          <MenuItem value=''>Select Property Type</MenuItem>
          <MenuItem value='studio'>Studio</MenuItem>
          <MenuItem value='coworking'>Coworking</MenuItem>
        </CustomTextField>
      </Grid>




      <Grid size={{ xs: 12 }}>
        <CustomTextField fullWidth multiline minRows={2} label='Address' placeholder='12, Business Park' />
      </Grid>

      <Grid size={{ xs: 12 }}>
              <CustomAutocomplete
                fullWidth
                multiple
                value={serviceoffreDetails}
                onChange={(event, value) => setserviceoffreDetails(value)}
                id='select-serviceoffre-details'
                options={serviceoffreArray}
                defaultValue={serviceoffreDetails}
                getOptionLabel={option => option || ''}
                renderInput={params => <CustomTextField {...params} label='ServiceOffre ' />}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => <Chip label={option} size='small' {...getTagProps({ index })} key={index} />)
                }
              />
      </Grid>

      </Grid>
      <div className='flex items-center justify-between'>
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
      </div>
    </div>
  )
}

export default StepPropertyDetails
