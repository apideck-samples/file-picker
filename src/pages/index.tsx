import { Button, useToast } from '@apideck/components'
import { File, FilePicker } from '@apideck/file-picker'
import camelCaseKeys from 'camelcase-keys'
import CodeBlock from 'components/CodeBlock'
import { decode } from 'jsonwebtoken'
import { applySession } from 'next-session'
import { Fragment, useEffect, useState } from 'react'
import { Session } from 'types/Session'
import { useSession } from 'utils/useSession'
import Layout from '../components/Layout'

// If your project does NOT use TailwindCSS you should import the CSS like this:
// import '@apideck/file-picker/dist/styles.css'

interface Props {
  jwt: string
  token: Session
}

const IndexPage = ({ jwt, token }: Props) => {
  const [file, setFile] = useState<File>()
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const { createSession, session, setSession, isLoading } = useSession()
  const { addToast } = useToast()

  useEffect(() => {
    if (token) {
      setSession({ ...token, jwt })
    }
  }, [jwt, setSession, token])

  const handleSelect = (data: File) => {
    setFile(data)
  }

  const handleDownload = () => {
    const downloadFile = async (file: File) => {
      const headers = {
        'Content-Type': 'application/json',
        'x-apideck-auth-type': 'JWT',
        'x-apideck-app-id': session?.applicationId || '',
        'x-apideck-consumer-id': session?.consumerId || '',
        Authorization: `Bearer ${jwt}`
      }

      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/file-storage/files/${file.id}/download`

      const response = await fetch(url, { headers })
      return response.blob()
    }

    if (session && file?.id) {
      setIsDownloading(true)
      downloadFile(file)
        .then((blob) => {
          const objectURL = URL.createObjectURL(blob)

          // Create download link and click it
          const link = document.createElement('a')
          link.href = objectURL
          link.setAttribute('download', file.name)
          document.body.appendChild(link)
          link.click()
          link?.parentNode?.removeChild(link)

          addToast({
            title: 'File successfully downloaded',
            description: file.name,
            image: blob.type?.startsWith('image') ? objectURL : undefined,
            type: 'success',
            closeAfter: 6000
          })
        })
        .catch((error) => {
          addToast({
            title: 'Downloading file failed',
            description: error?.message ? error.message : error,
            type: 'error'
          })
        })
        .finally(() => setIsDownloading(false))
    }
  }

  return (
    <Layout>
      <a
        href="https://github.com/apideck-samples/file-picker"
        target="_blank"
        rel="noreferrer"
        className="absolute hidden text-gray-500 transition-colors duration-200 xl:block hover:text-gray-600 top-5 right-5"
      >
        <svg width={24} height={24} viewBox="0 0 16 16" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
          />
        </svg>
      </a>
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        <div className="p-8 bg-white rounded-xl custom-shadow sm:max-w-lg sm:w-full">
          <img src="/img/logo.png" className="w-20 h-20 mx-auto -mt-12 rounded-full shadow-lg" />
          <div className="mt-3 text-center sm:mt-5">
            <h3 className="text-xl font-semibold leading-6 text-gray-800">Apideck File Picker</h3>
            <div className="mt-2">
              <p className="my-3 text-gray-500">
                The is a demo project for the{' '}
                <a className="font-semibold hover:text-blue-700" href="https://www.apideck.com">
                  Apideck
                </a>{' '}
                File Picker component. First create a session and then you can pick a file.
              </p>
              <div className="flex items-center justify-center">
                {session?.jwt ? (
                  <Fragment>
                    <FilePicker
                      jwt={session.jwt}
                      consumerId={session.consumerId}
                      appId={session.applicationId}
                      trigger={
                        <Button
                          text={file ? 'Pick new file' : 'Pick a file'}
                          variant={file ? 'outline' : 'primary'}
                        />
                      }
                      onSelect={handleSelect}
                    />
                    {file ? (
                      <Button
                        text="Download file"
                        onClick={handleDownload}
                        className="ml-3"
                        isLoading={isDownloading}
                      />
                    ) : null}
                  </Fragment>
                ) : (
                  <Button
                    onClick={createSession}
                    text="Create session"
                    isLoading={isLoading}
                    variant="outline"
                  />
                )}
              </div>
              {file ? (
                <div className="self-start flex-1 flex-grow mt-4 text-left text-gray-700">
                  <CodeBlock title={file?.name} code={JSON.stringify(file, null, 2)} lang="json" />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps({ req, res, query }: any): Promise<any> {
  await applySession(req, res)

  const { jwt } = query
  if (jwt) {
    req.session.jwt = jwt

    const decoded = decode(jwt) as Session
    if (decoded) {
      req.session.token = camelCaseKeys(decoded)
    }
  }

  return {
    props: {
      jwt: req.session.jwt || null,
      token: req.session.token || null
    }
  }
}

export default IndexPage
