import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import posthog from 'posthog-js'
import type { PostHogConfig } from 'posthog-js'

// Ported from the Apideck website tracking component so that product analytics
// across the marketing site and the sample apps land in the same PostHog project
// with consistent event names and properties.
//
// Uses the posthog-js singleton (not posthog-js/react) so it stays compatible
// with the older TypeScript versions some sample apps pin. Self-initializes when
// NEXT_PUBLIC_POSTHOG_KEY is set; renders nothing and does nothing otherwise.

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY

const UTM_KEYS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'gclid',
  'gbraid',
  'wbraid',
  'msclkid',
  'fbclid',
  'ttclid',
  'yclid',
  'gad_source',
  'source'
])

const DEFAULT_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost'

function buildOptions(): Partial<PostHogConfig> {
  // Only share cookies across *.apideck.com. On preview / non-apideck hosts we
  // keep persistence first-party so the browser doesn't silently drop the cookie.
  const isApideckHost =
    typeof window !== 'undefined' && window.location.hostname.endsWith('apideck.com')

  return {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://svc.apideck.com',
    ui_host: 'https://eu.posthog.com',
    capture_pageview: false,
    capture_pageleave: true,
    person_profiles: 'always',
    mask_all_text: true,
    autocapture: true,
    capture_performance: true,
    disable_session_recording: true,
    persistence: 'localStorage+cookie',
    ...(isApideckHost ? { cookie_domain: '.apideck.com', cross_subdomain_cookie: true } : {}),
    loaded: (ph) => {
      try {
        if (!isApideckHost && ph?.stopSessionRecording) ph.stopSessionRecording()
        if (process.env.NODE_ENV !== 'production') ph.debug()
      } catch {
        /* no-op */
      }
    }
  }
}

// Defer non-critical work to idle time to avoid blocking INP
function deferToIdle(callback: () => void, timeout = 2000): void {
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(callback, { timeout })
  } else {
    setTimeout(callback, 0)
  }
}

function parseUTMs(href: string): Record<string, string> {
  const base = typeof window !== 'undefined' ? window.location.origin : DEFAULT_BASE
  const u = new URL(href, base)
  const out: Record<string, string> = {}
  u.searchParams.forEach((v, k) => {
    if (UTM_KEYS.has(k)) out[k] = v
  })
  return out
}

interface PostHogTrackingProps {
  source?: string
}

export default function PostHogTracking({ source = 'sample' }: PostHogTrackingProps): null {
  const router = useRouter()
  const previousHref = useRef<string | null>(null)
  const [ready, setReady] = useState(false)

  // Initialize the PostHog singleton once (client-only).
  useEffect(() => {
    if (!POSTHOG_KEY || typeof window === 'undefined') return
    const ph = posthog as unknown as { __loaded?: boolean }
    if (!ph.__loaded) posthog.init(POSTHOG_KEY, buildOptions())
    setReady(true)
  }, [])

  // Initial pageview + first-touch attribution
  useEffect(() => {
    if (!ready || typeof window === 'undefined') return

    const href = window.location.href
    const ref = document.referrer || ''
    let domain = 'direct'
    if (ref) {
      const a = document.createElement('a')
      a.href = ref
      domain = a.hostname || 'direct'
    }
    const utms = parseUTMs(href)
    const initial: Record<string, string> = {
      initial_referrer: ref || 'direct',
      initial_referring_domain: domain
    }
    Object.entries(utms).forEach(([k, v]) => (initial[`initial_${k}`] = v))

    posthog.register_once(initial)
    if (Object.keys(utms).length) posthog.register(utms)

    const setOnceProps: Record<string, string> = {}
    Object.entries(initial).forEach(([k, v]) => {
      if (v !== undefined && v !== '') setOnceProps[`$${k}`] = v
    })

    posthog.capture('$pageview', {
      source,
      path: window.location.pathname,
      $current_url: href,
      $referrer: document.referrer || undefined,
      $title: document.title,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      is_mobile: window.innerWidth < 768,
      is_tablet: window.innerWidth >= 768 && window.innerWidth < 1024,
      is_desktop: window.innerWidth >= 1024,
      time_of_day: getTimeOfDay(),
      day_of_week: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      is_initial_pageview: true,
      ...(Object.keys(setOnceProps).length && { $set_once: setOnceProps }),
      ...(Object.keys(utms).length && { $set: utms })
    })

    previousHref.current = href
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  // Pageviews on client navigation
  useEffect(() => {
    if (!ready) return

    const onRoute = (url: string): void => {
      const next = new URL(url, window.location.origin)
      const href = next.href
      if (href === previousHref.current) return

      const utms = parseUTMs(href)
      if (Object.keys(utms).length) posthog.register(utms)

      setTimeout(() => {
        posthog.capture('$pageview', {
          source,
          path: next.pathname,
          $current_url: href,
          $referrer: previousHref.current || undefined,
          $title: document.title,
          viewport_width: window.innerWidth,
          viewport_height: window.innerHeight,
          is_mobile: window.innerWidth < 768,
          is_tablet: window.innerWidth >= 768 && window.innerWidth < 1024,
          is_desktop: window.innerWidth >= 1024,
          time_of_day: getTimeOfDay(),
          day_of_week: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
          is_spa_navigation: true
        })
      }, 50)

      previousHref.current = href
    }

    router.events.on('routeChangeComplete', onRoute)
    return () => router.events.off('routeChangeComplete', onRoute)
  }, [ready, router.events, source])

  // CTA clicks
  useEffect(() => {
    if (!ready || typeof window === 'undefined') return

    const onClick = (e: MouseEvent): void => {
      const target = (e.target as HTMLElement)?.closest?.(
        'a,button,[role="button"]'
      ) as HTMLElement | null
      if (!target) return
      if (target.closest('[data-analytics-ignore="true"]')) return
      const tag = (target.tagName || '').toLowerCase()
      const href = tag === 'a' ? target.getAttribute('href') || undefined : undefined
      const clickId = target.getAttribute('data-click-id') || target.id || null
      const label =
        target.getAttribute('aria-label') ||
        (target.textContent || '').trim().slice(0, 200) ||
        undefined
      const context =
        target.getAttribute('data-click-context') ||
        target.closest?.('[data-section]')?.getAttribute('data-section') ||
        undefined
      const path = window.location.pathname

      const isNavigatingLink =
        tag === 'a' && href && !href.startsWith('#') && !target.getAttribute('target')

      const captureClick = (): void => {
        posthog.capture('cta_click', {
          source,
          path,
          click_id: clickId,
          has_click_id: Boolean(clickId),
          tag,
          href,
          label,
          context
        })
      }

      if (isNavigatingLink) captureClick()
      else deferToIdle(captureClick)
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [ready, source])

  // Form submits
  useEffect(() => {
    if (!ready || typeof window === 'undefined') return

    const onSubmit = (e: Event): void => {
      const form = e.target as HTMLFormElement
      if (!form || form.nodeName !== 'FORM') return
      if (form.closest('[data-analytics-ignore="true"]')) return

      posthog.capture(form.getAttribute('data-ph-event') || 'form_submit', {
        source,
        path: window.location.pathname,
        form_id: form.getAttribute('id') || undefined,
        form_name: form.getAttribute('data-ph-form') || form.getAttribute('name') || undefined,
        action: form.getAttribute('action') || undefined
      })
    }

    document.addEventListener('submit', onSubmit, true)
    return () => document.removeEventListener('submit', onSubmit, true)
  }, [ready, source])

  // Scroll depth
  useEffect(() => {
    if (!ready || typeof window === 'undefined') return

    let maxScrollDepth = 0
    const scrollDepthMarks = [25, 50, 75, 90, 100]
    const firedMarks = new Set<number>()

    const calculateScrollDepth = (): void => {
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollPercent = Math.round(((scrollTop + window.innerHeight) / documentHeight) * 100)

      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent
        scrollDepthMarks.forEach((mark) => {
          if (scrollPercent >= mark && !firedMarks.has(mark)) {
            firedMarks.add(mark)
            posthog.capture('scroll_depth_reached', {
              source,
              depth_percent: mark,
              path: window.location.pathname,
              time_to_scroll: Math.round(performance.now())
            })
          }
        })
      }
    }

    const throttledScroll = throttle(calculateScrollDepth, 500)
    window.addEventListener('scroll', throttledScroll, { passive: true })

    const captureMaxDepth = (): void => {
      if (maxScrollDepth > 0) {
        posthog.capture('max_scroll_depth', {
          source,
          max_depth_percent: maxScrollDepth,
          path: window.location.pathname
        })
      }
    }
    window.addEventListener('beforeunload', captureMaxDepth)

    return () => {
      window.removeEventListener('scroll', throttledScroll)
      window.removeEventListener('beforeunload', captureMaxDepth)
    }
  }, [ready, source])

  // Rage clicks
  useEffect(() => {
    if (!ready || typeof window === 'undefined') return

    let clickEvents: { x: number; y: number; time: number }[] = []
    const THRESHOLD = 3
    const WINDOW = 1000
    const RADIUS = 30

    const detectRageClick = (e: MouseEvent): void => {
      const now = Date.now()
      clickEvents.push({ x: e.clientX, y: e.clientY, time: now })
      clickEvents = clickEvents.filter((c) => now - c.time < WINDOW)

      if (clickEvents.length >= THRESHOLD) {
        const recent = clickEvents.slice(-THRESHOLD)
        const first = recent[0]
        const nearby = recent.every(
          (c) => Math.sqrt(Math.pow(c.x - first.x, 2) + Math.pow(c.y - first.y, 2)) <= RADIUS
        )
        if (nearby) {
          const target = e.target as HTMLElement
          const selector = getElementSelector(target)
          const elementText = (target.textContent || '').trim().slice(0, 100)
          const elementTag = target.tagName
          const path = window.location.pathname
          const clickCount = clickEvents.length
          deferToIdle(() =>
            posthog.capture('rage_click', {
              source,
              path,
              selector,
              click_count: clickCount,
              element_text: elementText,
              element_tag: elementTag,
              position_x: e.clientX,
              position_y: e.clientY
            })
          )
          clickEvents = []
        }
      }
    }

    document.addEventListener('click', detectRageClick, true)
    return () => document.removeEventListener('click', detectRageClick, true)
  }, [ready, source])

  // Section views
  useEffect(() => {
    if (!ready || typeof window === 'undefined') return

    const trackedSections = new Set<Element>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !trackedSections.has(entry.target)) {
            trackedSections.add(entry.target)
            const el = entry.target as HTMLElement
            posthog.capture('section_viewed', {
              source,
              section_id: el.id || el.dataset.section || 'unknown',
              section_class: el.className || '',
              path: window.location.pathname,
              time_to_view: Math.round(performance.now()),
              viewport_percentage: Math.round(entry.intersectionRatio * 100)
            })
          }
        })
      },
      { threshold: [0.25, 0.5], rootMargin: '0px' }
    )

    document
      .querySelectorAll('section, [data-section], .hero, .features, .pricing, .cta, main > div')
      .forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [ready, source])

  return null
}

// Helper functions
function getTimeOfDay(): string {
  const hour = new Date().getHours()
  if (hour < 6) return 'night'
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

function throttle<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: ReturnType<typeof setTimeout>
  let lastCall = 0
  return function executedFunction(...args: any[]) {
    const now = Date.now()
    if (now - lastCall >= wait) {
      lastCall = now
      func(...args)
    } else {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        lastCall = Date.now()
        func(...args)
      }, wait - (now - lastCall))
    }
  } as T
}

function getElementSelector(element: HTMLElement): string {
  if (element.id) return `#${element.id}`
  if (element.className && typeof element.className === 'string') {
    const classes = element.className
      .split(' ')
      .filter((c) => c)
      .join('.')
    if (classes) return `.${classes}`
  }
  return element.tagName.toLowerCase()
}
