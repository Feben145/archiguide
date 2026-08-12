import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// TypeScript may complain about side-effect CSS imports in some setups.
// @ts-ignore
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'


const inter = Inter({ subsets: ['latin'] })


export const metadata: Metadata = {
  title: 'IT Asset — Enterprise IT Asset management platform',
  description: 'IT Asset Management Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-bg text-text-1 antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}