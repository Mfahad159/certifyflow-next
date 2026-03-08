import TemplatesPage from '@/components/Landing/templates/TemplatesPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Templates | BulkCerts',
    description: 'Browse our collection of professional certificate templates.',
}

export default function Page() {
    return <TemplatesPage />
}
