import FeaturesPage from '@/components/Landing/features/FeaturesPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Features | BulkCerts',
    description: 'Everything you need for stress-free certificates.',
}

export default function Page() {
    return <FeaturesPage />
}
