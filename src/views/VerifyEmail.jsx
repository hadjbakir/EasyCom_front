'use client'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button, Typography, Box } from '@mui/material'
import { getLocalizedUrl } from '@/utils/i18n'

const VerifyEmail = () => {
  const { lang: locale } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight='100vh'>
      <i className='tabler-mail-check text-[88px] mbe-6 text-success' />
      <Typography variant='h4' gutterBottom>
        Merci de vérifier votre adresse email
      </Typography>
      <Typography variant='body1' color='text.secondary' gutterBottom>
        Un email de confirmation a été envoyé à <b>{email}</b>.<br />
        Veuillez cliquer sur le lien dans votre boîte de réception pour activer votre compte.
      </Typography>
      <Button
        variant='contained'
        color='primary'
        sx={{ mt: 4 }}
        onClick={() => router.push(getLocalizedUrl('/login', locale))}
      >
        Aller à la connexion
      </Button>
    </Box>
  )
}

export default VerifyEmail
