import './global.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Navbar } from './components/nav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Footer from './components/footer'
import { baseUrl } from './sitemap'

import Script from 'next/script'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'DR check AI',
    template: '%s | DR check AI',
  },
  description: 'This is my portfolio.',
  openGraph: {
    title: 'My Portfolio',
    description: 'This is my portfolio.',
    url: baseUrl,
    siteName: 'My Portfolio',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const cx = (...classes) => classes.filter(Boolean).join(' ')

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className="scroll-smooth"
    >
    
      <body className="flex flex-col min-h-screen">

<div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
  <div className="floating-element absolute top-20 left-10 w-32 h-32 bg-teal-200 rounded-full opacity-20" />
  <div className="floating-element absolute top-60 right-20 w-24 h-24 bg-emerald-200 rounded-full opacity-25" style={{animationDelay: '2s'}} />
  <div className="floating-element absolute bottom-40 left-1/4 w-20 h-20 bg-cyan-200 rounded-full opacity-20" style={{animationDelay: '4s'}} />
</div>


        
          <Navbar />
          {children}
          <Footer />
          <Analytics />
          <SpeedInsights />

      </body>
    </html>
  )
}
