import Verification from '@/components/dashboard/verification/Verification'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Verify | BulkCerts',
    description: 'Instant validation of digital assets.',
}

export default function Page() {
    return <Verification />
}
