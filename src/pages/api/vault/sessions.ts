import { VercelRequest, VercelResponse } from '@vercel/node'

import fetch from 'node-fetch'

const consumerId =
  process.env.NEXT_PUBLIC_CONSUMER_ID ||
  `demo-${Math.random().toString(36).substring(7)}-${new Date().toISOString()}`

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
  'X-APIDECK-CONSUMER-ID': consumerId,
  'X-APIDECK-APP-ID': `${process.env.NEXT_PUBLIC_APP_ID}`
}

export default async (req: VercelRequest, res: VercelResponse) => {
  const { body } = req
  const raw = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/vault/sessions`, {
    method: 'POST',
    headers,
    body
  })
  const response = await raw.json()
  res.json(response)
}
