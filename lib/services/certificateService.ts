import { createClient } from '@/lib/supabase/server'

export type Certificate = {
    certificate_uuid: string
    campaign_id: string
    user_id: string
    recipient_data: any
    status: string
    created_at: string
    viewed_at: string | null
}

export async function getCertificatesByCampaign(campaignId: string): Promise<Certificate[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error(`Error fetching certificates for campaign ${campaignId}:`, error.message)
        throw new Error(error.message)
    }

    return data as Certificate[]
}

export async function getCertificateByUUID(uuid: string): Promise<Certificate | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_uuid', uuid)
        .single()

    if (error) {
        console.error(`Error fetching certificate with uuid ${uuid}:`, error.message)
        return null
    }

    return data as Certificate
}

export async function createCertificate(certificateData: Partial<Certificate>): Promise<Certificate> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
        .from('certificates')
        .insert([
            { ...certificateData, user_id: user.id }
        ])
        .select()
        .single()

    if (error) {
        console.error('Error creating certificate:', error.message)
        throw new Error(error.message)
    }

    return data as Certificate
}
