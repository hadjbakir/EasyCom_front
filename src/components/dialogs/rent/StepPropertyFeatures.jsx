// React Imports
import { useState } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Radio from '@mui/material/Radio'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'


// Component Imports
import CustomAutocomplete from '@core/components/mui/Autocomplete'
import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'
import DirectionalIcon from '@components/DirectionalIcon'

// Config Imports
import themeConfig from '@configs/themeConfig'

const furnishingArray = [
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

const StepPropertyFeatures = ({ activeStep, isLastStep, handleNext, handlePrev }) => {
  // States
  const [value, setValue] = useState('firebase')

  // States
  const [furnishingDetails, setFurnishingDetails] = useState(['Fridge', 'AC', 'TV'])

  const handleChange = event => {
    setValue(event.target.value)
  }

  return (
    <div className='flex flex-col gap-6'>
      <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6 }}>
        <CustomTextField fullWidth label='Bedrooms' placeholder='3' />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CustomTextField fullWidth label='Floor No' placeholder='12' />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CustomTextField fullWidth label='Bathroom' placeholder='4' />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CustomTextField select fullWidth id='demo-simple-select' label='Furnished Status' defaultValue=''>
          <MenuItem value=''>Select Furnished Status</MenuItem>
          <MenuItem value='fully-furnished'>Fully Furnished</MenuItem>
          <MenuItem value='furnished'>Furnished</MenuItem>
          <MenuItem value='semi-furnished'>Semi Furnished</MenuItem>
          <MenuItem value='unfurnished'>UnFurnished</MenuItem>
        </CustomTextField>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CustomAutocomplete
          fullWidth
          multiple
          value={furnishingDetails}
          onChange={(event, value) => setFurnishingDetails(value)}
          id='select-furnishing-details'
          options={furnishingArray}
          defaultValue={furnishingDetails}
          getOptionLabel={option => option || ''}
          renderInput={params => <CustomTextField {...params} label='Furnishing Details' />}
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

export default StepPropertyFeatures
