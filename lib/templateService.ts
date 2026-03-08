import { supabase } from './supabaseClient'
import type { Database } from './database.types'

export type PublicTemplate = Database['public']['Tables']['public_templates']['Row']
export type PrivateTemplate = Database['public']['Tables']['private_templates']['Row']

export const templateService = {
  // Get all public templates
  async getPublicTemplates() {
    const { data, error } = await supabase
      .from('public_templates')
      .select('*')
      .order('usage_count', { ascending: false })

    if (error) throw error
    return (data || []) as PublicTemplate[]
  },

  // Get all private templates for a user
  async getUserTemplates(userId: string) {
    const { data, error } = await supabase
      .from('private_templates')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return (data || []) as PrivateTemplate[]
  },

  // Get a single private template
  async getPrivateTemplate(templateId: string) {
    const { data, error } = await supabase
      .from('private_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (error) throw error
    return data as PrivateTemplate
  },

  // Get a single public template
  async getPublicTemplate(templateId: string) {
    const { data, error } = await supabase
      .from('public_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (error) throw error
    return data as PublicTemplate
  },

  // Create a new private template
  async createTemplate(template: {
    user_id: string
    name: string
    description?: string
    thumbnail_url?: string
    template_data?: any
    category?: string
  }) {
    const { data, error } = await supabase
      .from('private_templates')
      .insert([template])
      .select()
      .single()

    if (error) throw error
    return data as PrivateTemplate
  },

  // Update an existing private template
  async updateTemplate(
    templateId: string,
    updates: {
      name?: string
      description?: string
      thumbnail_url?: string
      template_data?: any
      category?: string
    }
  ) {
    const { data, error } = await supabase
      .from('private_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId)
      .select()
      .single()

    if (error) throw error
    return data as PrivateTemplate
  },

  // Delete a private template
  async deleteTemplate(templateId: string) {
    const { error } = await supabase
      .from('private_templates')
      .delete()
      .eq('id', templateId)

    if (error) throw error
  },

  // Generate thumbnail from HTML (Placeholder)
  async generateThumbnail(_htmlContent: string, _cssContent?: string): Promise<string> {
    return 'https://via.placeholder.com/200x140/667eea/ffffff?text=Certificate'
  }
}

