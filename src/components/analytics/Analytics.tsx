import { PropsWithChildren } from 'react'
import HubspotTracking from './HubspotTracking'
import PostHogTracking from './PostHogTracking'

// Single entry point for analytics in the sample apps. Renders the app plus the
// HubSpot + PostHog trackers. PostHog self-initializes only when
// NEXT_PUBLIC_POSTHOG_KEY is set; HubSpot defaults to the Apideck portal (blank
// NEXT_PUBLIC_HUBSPOT_ID to disable it). Config mirrors the Apideck website so
// events land in the same PostHog project / HubSpot portal.

const isPostHogEnabled = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY)

interface AnalyticsProps {
  source?: string
}

export default function Analytics({
  source = 'sample',
  children
}: PropsWithChildren<AnalyticsProps>): JSX.Element {
  return (
    <>
      {children}
      <HubspotTracking />
      {isPostHogEnabled && <PostHogTracking source={source} />}
    </>
  )
}
