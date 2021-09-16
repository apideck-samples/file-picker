import { ReactNode, createContext, useContext, useState } from 'react'

import { Session } from 'types/Session'
import { createVaultSession } from './createVaultSession'
import { useRouter } from 'next/router'

interface ContextProps {
  createSession: () => Promise<void>
  setSession: (session: Session) => void
  session?: Session
  isLoading: boolean
}

const SessionContext = createContext<Partial<ContextProps>>({})

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { push } = useRouter()

  const createSession = async () => {
    setIsLoading(true)
    const response = await createVaultSession()
    const sessionUrl = response?.data?.session_uri
    const jwt = sessionUrl.substring(sessionUrl.lastIndexOf('/') + 1)
    if (jwt) {
      push(`/session/${jwt}`)
    }
    setIsLoading(false)
  }

  return (
    <SessionContext.Provider value={{ createSession, session, setSession, isLoading }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  return useContext(SessionContext) as ContextProps
}
