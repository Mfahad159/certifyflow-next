import { createClient } from '@/lib/supabase/server'

export type Campaign = {
    id: string
    user_id: string
    name: string
    template_data: any
    qr_code_settings: any
    status: string
    created_at: string
    updated_at: string
    type?: string
    total_certificates?: number
    certificates_generated?: number
    emails_sent?: number
}

export type UserStats = {
    id?: string
    user_id: string
    total_certificates_generated: number
    total_emails_sent: number
    total_campaigns: number
    success_rate: number
    total_templates_created?: number
}

export async function getCampaigns(): Promise<Campaign[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching campaigns:', error.message)
        throw new Error(error.message)
    }

    return data as Campaign[]
}

export async function getRecentCampaigns(userId: string): Promise<Campaign[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

    if (error) {
        console.error('Error fetching recent campaigns:', error.message)
        throw new Error(error.message)
    }

    return data as Campaign[]
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error(`Error fetching campaign with id ${id}:`, error.message)
        return null
    }

    return data as Campaign
}

export async function createCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
    const supabase = await createClient()

    // Need to get user_id to correctly assign the campaign to the logged-in user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
        .from('campaigns')
        .insert([
            { ...campaignData, user_id: user.id }
        ])
        .select()
        .single()

    if (error) {
        console.error('Error creating campaign:', error.message)
        throw new Error(error.message)
    }

    return data as Campaign
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            return {
                user_id: userId,
                total_certificates_generated: 0,
                total_emails_sent: 0,
                total_campaigns: 0,
                success_rate: 0
            }
        }
        console.error('Error fetching user stats:', error.message)
        return null
    }

    return data as UserStats
}
