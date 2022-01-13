import { VercelRequest, VercelResponse } from '@vercel/node'
import fetch from 'node-fetch'

export default async (req: VercelRequest, res: VercelResponse) => {
  const { fileId } = req.query

  if (!fileId) {
    res.status(400).json({ message: 'missing fileId in query' })
    return
  }

  const unifyDownloadUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/file-storage/files/${fileId}/download`

  const raw = await fetch(unifyDownloadUrl, {
    headers: {
      'x-apideck-auth-type': req.headers['x-apideck-auth-type'] as string,
      'x-apideck-app-id': req.headers['x-apideck-app-id'] as string,
      'x-apideck-consumer-id': req.headers['x-apideck-consumer-id'] as string,
      'x-apideck-service-id': req.headers['x-apideck-service-id'] as string,
      Authorization: req.headers.authorization as string
    },
    redirect: 'manual'
  })

  if (raw.status === 301) {
    res.json({ download_url: raw.headers.get('location'), external: true })
    return
  }

  if (raw.status >= 400) {
    res.status(raw.status).send(raw.body)
    return
  }

  res.send({ download_url: unifyDownloadUrl, external: false })
}
