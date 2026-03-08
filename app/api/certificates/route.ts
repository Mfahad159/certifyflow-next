import { NextResponse } from 'next/server'
import { createCertificate } from '@/lib/services/certificateService'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        if (!body.campaign_id || !body.recipient_data) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const newCertificate = await createCertificate(body)

        return NextResponse.json({ certificate: newCertificate }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
