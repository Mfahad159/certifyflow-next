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
