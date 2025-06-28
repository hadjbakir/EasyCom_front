// Next Imports
import { headers } from 'next/headers'

// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Config Imports
import { i18n } from '@configs/i18n'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Context Imports
import { UserProvider } from '@/contexts/UserContext'
import { NextAuthProvider } from '@/contexts/nextAuthProvider'
import { CartProvider } from '@/components/contexts/CartContext'
import { ProductProvider } from '@/components/contexts/ProductContext'
import { SavedProvider } from '@/components/contexts/SavedContext'
import { NegotiationProvider } from '@/components/contexts/NegotiationContext'
import { OrderProvider } from '@/components/contexts/OrderContext'
import { ServiceOrderProvider } from '@/components/contexts/ServiceOrderContext'

// Component Imports
import ChatbotWrapper from '@/components/Chatbot/ChatbotWrapper'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

// Style Imports
import '@/app/globals.css'

import ReduxProvider from '@/redux-store/ReduxProvider'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

// HOC Imports
import TranslationWrapper from '@/hocs/TranslationWrapper'

export const metadata = {
  title: 'EasyCom',
  description: 'Ecommerce centralisation platform'
}

const RootLayout = async props => {
  const params = await props.params
  const { children } = props

  // Vars
  const headersList = await headers()
  const systemMode = await getSystemMode()
  const direction = i18n.langDirection[params.lang]

  return (
    <TranslationWrapper headersList={headersList} lang={params.lang}>
      <html id='__next' lang={params.lang} dir={direction} suppressHydrationWarning>
        <head>
          <link rel="icon" type="image/png" sizes="32x32" href="/images/logos/mon-logo.png" />
          <link rel="icon" type="image/png" sizes="64x64" href="/images/logos/mon-logo.png" />
          <link rel="icon" type="image/png" sizes="128x128" href="/images/logos/mon-logo.png" />
          <link rel="icon" type="image/png" sizes="256x256" href="/images/logos/mon-logo.png" />
        </head>
        <body className='flex is-full min-bs-full flex-auto flex-col'>
          <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
          <NextAuthProvider>
            <ProductProvider>
              <SavedProvider>
                <NegotiationProvider>
                  <OrderProvider>
                    <ServiceOrderProvider>
            <CartProvider>
              <UserProvider>
                {children}
                <ChatbotWrapper />
              </UserProvider>
            </CartProvider>
                    </ServiceOrderProvider>
                  </OrderProvider>
                </NegotiationProvider>
              </SavedProvider>
            </ProductProvider>
          </NextAuthProvider>
        </body>
      </html>
    </TranslationWrapper>
  )
}

export default RootLayout
