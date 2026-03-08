import PricingPage from '@/components/Landing/pricing/PricingPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Pricing | BulkCerts',
    description: 'Simple, transparent pricing for any size team.',
}

export default function Page() {
    return <PricingPage />
}
