import VerifyEmail from '@views/VerifyEmail'
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata = {
  title: 'Vérification Email',
  description: 'Vérifiez votre adresse email pour activer votre compte.'
}

const VerifyEmailPage = async () => {
  // Vars
  const mode = await getServerMode()
  return <VerifyEmail mode={mode} />
}

export default VerifyEmailPage
