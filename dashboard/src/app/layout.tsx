import type { Metadata } from 'next'
import { Orbitron, Share_Tech_Mono } from 'next/font/google'
import './globals.css'

const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' })
const shareTechMono = Share_Tech_Mono({ weight: '400', subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Anomaly Grid — AI Cybersecurity Platform',
  description: 'Real-time network monitoring, threat fingerprinting, and actor profiling powered by NVIDIA Morpheus.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${orbitron.variable} ${shareTechMono.variable} font-[family-name:var(--font-orbitron)] bg-[#030305] text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
