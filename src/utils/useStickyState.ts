import { useEffect, useState } from 'react'

export const useStickyState = (defaultValue: any, key: string) => {
  const [value, setValue] = useState(() => {
    const stickyValue = typeof window !== 'undefined' ? window.sessionStorage.getItem(key) : null
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue
  })

  useEffect(() => {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue]
}
