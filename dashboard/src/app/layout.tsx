import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Anomaly Grid — AI Cybersecurity Platform',
  description: 'Real-time network monitoring, threat fingerprinting, and actor profiling powered by NVIDIA Morpheus.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#030305] text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
