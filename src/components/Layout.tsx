import Head from 'next/head'
import React, { ReactNode } from 'react'

type Props = {
  children: ReactNode
  title?: string
  description?: string
  favicon?: string
  image?: string
}

const Layout = ({
  children,
  title = 'Apideck File Picker',
  description = 'A sample project showcasing the React File Picker component that works with the Apideck File Storage API',
  favicon = '/img/logo.png',
  image = '/img/filepicker.png'
}: Props) => (
  <div>
    <Head>
      <title>{title}</title>
      <meta name="description" content={description}></meta>
      <meta name="robots" content="noindex" />
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <link rel="icon" href={favicon} />

      {/* OG  */}
      <meta property="og:type" content="website" />
      <meta property="og:image" content={image} />
      <meta property="og:image:type" content="image/jpg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@Apideck" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Head>
    <div className="min-h-screen">{children}</div>
  </div>
)

export default Layout
