export const createVaultSession = async (url?: string) => {
  const response = await fetch('/api/vault/sessions', {
    method: 'POST',
    body: JSON.stringify({
      redirect_uri: url || window.location.href,
      settings: {
        sandbox_mode: true,
        isolation_mode: true,
        show_suggestions: false,
        auto_redirect: true,
        unified_apis: ['file-storage'],
        session_length: '30m'
      }
    })
  })
  return response.json()
}
