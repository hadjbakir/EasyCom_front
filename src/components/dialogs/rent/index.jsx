'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { styled } from '@mui/material/styles'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'
import MuiStep from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import StepPropertyArea from './StepPropertyArea'
import CustomAvatar from '@core/components/mui/Avatar'
import StepPersonalDetails from './StepPersonalDetails'
import DialogCloseButton from '../DialogCloseButton'
import StepPropertyDetails from './StepPropertyDetails'
import StepPriceDetails from './StepPriceDetails'

// Styled Component Imports
import StepperWrapper from '@core/styles/stepper'

const steps = [
  {
    icon: 'tabler-users',
    title: 'Personal Details',
    subtitle: 'Your Name/Email'
  },
  {
    icon: 'tabler-home',
    title: 'Property Details',
    subtitle: 'Property Type'
  },

  {
    icon: 'tabler-map-pin',
    title: 'Images',
    subtitle: 'Images of Area'
  },
  {
    icon: 'tabler-currency-dollar',
    title: 'Price Details',
    subtitle: 'Expected Price'
  }
]

const Step = styled(MuiStep)({
  '&.Mui-completed .step-title , &.Mui-completed .step-subtitle': {
    color: 'var(--mui-palette-text-disabled)'
  }
})

const renderStepCount = (activeStep, isLastStep, handleNext, handlePrev) => {
  const Tag =
    activeStep === 0
      ? StepPersonalDetails
      : activeStep === 1
        ? StepPropertyDetails
          : activeStep === 2
            ? StepPropertyArea
            : StepPriceDetails

  return <Tag activeStep={activeStep} handleNext={handleNext} handlePrev={handlePrev} isLastStep={isLastStep} />
}

const CreateApp = ({ open, setOpen }) => {
  // States
  const [activeStep, setActiveStep] = useState(0)

  const handleClose = () => {
    setOpen(false)
    setActiveStep(0)
  }

  const handleStep = step => () => {
    setActiveStep(step)
  }

  // Vars
  const isLastStep = activeStep === steps.length - 1

  const handleNext = () => {
    if (!isLastStep) {
      setActiveStep(prevActiveStep => prevActiveStep + 1)
    } else {
      handleClose()
    }
  }

  const handlePrev = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  return (
    <Dialog
      fullWidth
      maxWidth='md'
      open={open}
      onClose={handleClose}
      scroll='body'
      closeAfterTransition={false}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        Create App
        <Typography component='span' className='flex flex-col text-center'>
          Provide data with this form to create your app.
        </Typography>
      </DialogTitle>
      <DialogContent className='pbs-0 sm:pli-16 sm:pbe-16'>
        <div className='flex gap-y-6 flex-col md:flex-row md:gap-5'>
          <StepperWrapper>
            <Stepper
              activeStep={activeStep}
              orientation='vertical'
              connector={<></>}
              className='flex flex-col gap-4 min-is-[220px]'
            >
              {steps.map((label, index) => {
                return (
                  <Step key={index} onClick={handleStep(index)}>
                    <StepLabel icon={<></>} className='p-1 cursor-pointer'>
                      <div className='step-label'>
                        <CustomAvatar
                          variant='rounded'
                          skin={activeStep === index ? 'filled' : 'light'}
                          {...(activeStep >= index && { color: 'primary' })}
                          {...(activeStep === index && { className: 'shadow-primarySm' })}
                          size={38}
                        >
                          <i className={classnames(label.icon, 'text-[22px]')} />
                        </CustomAvatar>
                        <div className='flex flex-col'>
                          <Typography className='uppercase step-title'>{label.title}</Typography>
                          <Typography className='step-subtitle'>{label.subtitle}</Typography>
                        </div>
                      </div>
                    </StepLabel>
                  </Step>
                )
              })}
            </Stepper>
          </StepperWrapper>
          <div className='flex-1'>{renderStepCount(activeStep, isLastStep, handleNext, handlePrev)}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateApp
