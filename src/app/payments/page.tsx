import type { Metadata, Viewport } from 'next'
import { PaymentHistory } from '@/components/PaymentHistory'

export const metadata: Metadata = {
  title: 'Payment History - DM Soles',
  description: 'View your payment history and transactions',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function PaymentsPage() {
  return <PaymentHistory />
}
