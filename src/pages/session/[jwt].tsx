import { Session } from 'types/Session'
import { applySession } from 'next-session'
import camelCaseKeys from 'camelcase-keys'
import { decode } from 'jsonwebtoken'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useToast } from '@apideck/components'

type IProps = { token: Session }
const SessionPage = ({ token }: IProps) => {
  const { push } = useRouter()
  const { addToast } = useToast()

  useEffect(() => {
    if (token) {
      push('/')
      addToast({
        title: 'Session created',
        description: 'You can now use the file picker',
        autoClose: true,
        type: 'success'
      })
    }
  }, [addToast, push, token])

  return <div />
}

export async function getServerSideProps({ req, res, query }: any): Promise<any> {
  await applySession(req, res)

  const { jwt } = query
  req.session.jwt = jwt

  const decoded = decode(jwt) as Session
  if (decoded) {
    req.session.token = camelCaseKeys(decoded)
  }

  return {
    props: {
      jwt: req.session.jwt,
      token: req.session.token
    }
  }
}

export default SessionPage
