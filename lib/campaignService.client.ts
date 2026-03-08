import { supabase } from './supabaseClient'
import type { Database } from './database.types'

type Campaign = Database['public']['Tables']['campaigns']['Row']
type CampaignInsert = Database['public']['Tables']['campaigns']['Insert']
type CampaignUpdate = Database['public']['Tables']['campaigns']['Update']
type UserStats = Database['public']['Tables']['user_stats']['Row']

export const campaignService = {
  // Get all campaigns for current user
  async getUserCampaigns(userId: string): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get recent campaigns (limit 5)
  async getRecentCampaigns(userId: string): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) throw error
    return data || []
  },

  // Get active/processing campaigns
  async getActiveCampaigns(userId: string): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'processing')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Create new campaign
  async createCampaign(campaign: CampaignInsert): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaign)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update campaign
  async updateCampaign(id: string, updates: CampaignUpdate): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete campaign
  async deleteCampaign(id: string): Promise<void> {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Get user stats
  async getUserStats(userId: string): Promise<UserStats | null> {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      // If no stats exist, create them
      if (error.code === 'PGRST116') {
        return await this.initializeUserStats(userId)
      }
      throw error
    }
    return data
  },

  // Initialize user stats
  async initializeUserStats(userId: string): Promise<UserStats> {
    const { data, error } = await supabase
      .from('user_stats')
      .insert({
        user_id: userId,
        total_certificates_generated: 0,
        total_emails_sent: 0,
        total_campaigns: 0,
        success_rate: 0
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update user stats based on campaigns
  async updateUserStats(userId: string): Promise<UserStats> {
    // Get all completed campaigns
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (campaignsError) throw campaignsError

    const totalCertificates = campaigns?.reduce((sum, c) => sum + (c.certificates_generated || 0), 0) || 0
    const totalEmails = campaigns?.reduce((sum, c) => sum + (c.emails_sent || 0), 0) || 0
    const totalCampaigns = campaigns?.length || 0

    // Calculate success rate
    const { data: allCampaigns } = await supabase
      .from('campaigns')
      .select('status')
      .eq('user_id', userId)

    const completedCount = allCampaigns?.filter(c => c.status === 'completed').length || 0
    const totalCount = allCampaigns?.length || 1
    const successRate = (completedCount / totalCount) * 100

    // Get templates count
    const { count: templateCount, error: templateError } = await supabase
      .from('private_templates')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (templateError) throw templateError

    const { data, error } = await supabase
      .from('user_stats')
      .upsert({
        user_id: userId,
        total_certificates_generated: totalCertificates,
        total_emails_sent: totalEmails,
        total_campaigns: totalCampaigns,
        total_templates_created: templateCount || 0,
        success_rate: successRate,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

