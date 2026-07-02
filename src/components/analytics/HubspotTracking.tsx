import { useEffect } from 'react'
import { useRouter } from 'next/router'

// Ported from the Apideck website. Loads the HubSpot tracking script and reports
// SPA page views. Defaults match the marketing site (EU data residency) so sample
// traffic shows up in the same HubSpot portal. Set NEXT_PUBLIC_HUBSPOT_ID to
// override; leave it unset to disable HubSpot entirely.

const DEFAULT_HUBSPOT_REGION = 'eu1'
const DEFAULT_HUBSPOT_ID = '144566223'

interface HubspotTrackingProps {
  hubspotId?: string
  region?: string
}

export default function HubspotTracking({ hubspotId, region }: HubspotTrackingProps): null {
  const router = useRouter()

  const hsId = hubspotId || process.env.NEXT_PUBLIC_HUBSPOT_ID || DEFAULT_HUBSPOT_ID
  const hsRegion = region || process.env.NEXT_PUBLIC_HUBSPOT_REGION || DEFAULT_HUBSPOT_REGION

  // Load HubSpot script
  useEffect(() => {
    if (!hsId) return

    const endpoint = hsRegion === 'eu1' ? 'js-eu1.hs-scripts.com' : 'js.hs-scripts.com'

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.id = 'hs-script-loader'
    script.async = true
    script.defer = true
    script.src = `//${endpoint}/${hsId}.js`
    document.body.appendChild(script)

    return () => {
      document.getElementById('hs-script-loader')?.remove()
    }
  }, [hsId, hsRegion])

  // Track page views on route changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleRouteChange = (url: string): void => {
      const w = window as any
      if (w._hsq === undefined) w._hsq = []
      w._hsq.push(['setPath', url])
      w._hsq.push(['trackPageView'])
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => router.events.off('routeChangeComplete', handleRouteChange)
  }, [router])

  return null
}
