// React Imports
import { useEffect, useRef, useState } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

// Third-party Imports
import classnames from 'classnames'
import emailjs from 'emailjs-com'

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'

// Hook Imports
import { useIntersection } from '@/hooks/useIntersection'

// Styles Imports
import frontCommonStyles from '@views/front-pages/styles.module.css'
import styles from './styles.module.css'

const ContactUs = () => {
  // Refs
  const skipIntersection = useRef(true)
  const ref = useRef(null)
  const form = useRef()

  // Hooks
  const { updateIntersections } = useIntersection()

  // State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (skipIntersection.current) {
          skipIntersection.current = false

          return
        }

        updateIntersections({ [entry.target.id]: entry.isIntersecting })
      },
      { threshold: 0.35 }
    )

    ref.current && observer.observe(ref.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendEmail = e => {
    e.preventDefault()

    // Utilisation des identifiants fournis par l'utilisateur
    emailjs.sendForm('service_npx3bif', 'template_sgwgql6', form.current, '6MUbApdkrBmeviZcc').then(
      () => {
        setNotification({ open: true, message: 'Message sent successfully!', severity: 'success' })

        // Clear form fields
        setFullName('')
        setEmail('')
        setMessage('')
      },
      () => {
        setNotification({ open: true, message: 'Failed to send message, please try again.', severity: 'error' })
      }
    )
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setNotification({ ...notification, open: false })
  }

  return (
    <section id='contact-us' className='plb-[100px] bg-backgroundDefault' ref={ref}>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
      <div className={classnames('flex flex-col gap-14', frontCommonStyles.layoutSpacing)}>
        <div className='flex flex-col gap-y-4 items-center justify-center'>
          <Chip size='small' variant='tonal' color='primary' label='Contact Us' />
          <div className='flex flex-col items-center gap-y-1 justify-center flex-wrap'>
            <div className='flex items-center gap-x-2'>
              <Typography color='text.primary' variant='h4'>
                <span className='relative z-[1] font-extrabold'>
                  Let&#39;s work
                  <img
                    src='/images/front-pages/landing-page/bg-shape.png'
                    alt='bg-shape'
                    className='absolute block-end-0 z-[1] bs-[40%] is-[132%] -inline-start-[19%] block-start-[17px]'
                  />
                </span>{' '}
                together
              </Typography>
            </div>
            <Typography className='text-center'>Any question or remark? just write us a message</Typography>
          </div>
        </div>
        <div className='lg:pis-[38px]'>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, md: 6, lg: 5 }}>
              <div className={classnames('border p-[10px] relative', styles.contactRadius)}>
                <img
                  src='/images/front-pages/landing-page/contact-border.png'
                  className='absolute -block-start-[7%] -inline-start-[8%] max-is-full max-lg:hidden '
                  alt='contact-border'
                  width='180'
                />
                <img
                  src='/images/front-pages/landing-page/customer-service.png'
                  alt='customer-service'
                  className={classnames('is-full', styles.contactRadius)}
                />
                <div className='flex justify-between flex-wrap gap-4 pli-6 pbs-4 pbe-[10px]'>
                  <div className='flex gap-3'>
                    <CustomAvatar variant='rounded' size={36} skin='light' color='primary'>
                      <i className='tabler-mail' />
                    </CustomAvatar>
                    <div>
                      <Typography>Email</Typography>
                      <Typography color='text.primary' className='font-medium'>
                        support@easycom.com
                      </Typography>
                    </div>
                  </div>
                  <div className='flex gap-3'>
                    <CustomAvatar variant='rounded' size={36} skin='light' color='success'>
                      <i className='tabler-phone' />
                    </CustomAvatar>
                    <div>
                      <Typography>Phone</Typography>
                      <Typography color='text.primary' className='font-medium'>
                        +213 7 82 71 07 57
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 7 }}>
              <Card>
                <CardContent>
                  <div className='flex flex-col gap-y-[6px] mbe-6'>
                    <Typography variant='h4'>Send a message</Typography>
                    <Typography>
                      If you would like to discuss anything related to payment, account, licensing, partnerships, or
                      have pre-sales questions, you&#39;re at the right place.
                    </Typography>
                  </div>
                  <form ref={form} onSubmit={sendEmail} className='flex flex-col items-start gap-6'>
                    <div className='flex gap-5 is-full'>
                      <CustomTextField
                        fullWidth
                        label='Full name'
                        id='name-input'
                        name='user_name'
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                      />
                      <CustomTextField
                        fullWidth
                        label='Email address'
                        id='email-input'
                        type='email'
                        name='user_email'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                    <CustomTextField
                      fullWidth
                      multiline
                      rows={7}
                      label='Message'
                      id='message-input'
                      name='message'
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                    />
                    <Button variant='contained' type='submit'>
                      Send Inquiry
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </div>
      </div>
    </section>
  )
}

export default ContactUs
