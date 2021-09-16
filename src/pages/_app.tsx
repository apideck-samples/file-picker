import 'styles/index.css'

import { AppProps } from 'next/app'
import { SessionProvider } from 'utils/useSession'
import { ToastProvider } from '@apideck/components'

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <ToastProvider>
      <SessionProvider>
        <Component {...pageProps} />
      </SessionProvider>
    </ToastProvider>
  )
}
