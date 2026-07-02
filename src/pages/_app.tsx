import 'styles/index.css'

import { AppProps } from 'next/app'
import { SessionProvider } from 'utils/useSession'
import { ToastProvider } from '@apideck/components'
import Analytics from 'components/analytics/Analytics'

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <Analytics source="sample:file-picker">
      <ToastProvider>
        <SessionProvider>
          <Component {...pageProps} />
        </SessionProvider>
      </ToastProvider>
    </Analytics>
  )
}
