export const createVaultSession = async (url?: string) => {
  const response = await fetch('/api/vault/sessions', {
    method: 'POST',
    body: JSON.stringify({ redirect_uri: url || window.location.href })
  })
  return response.json()
}
