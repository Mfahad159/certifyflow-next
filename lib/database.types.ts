export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      campaigns: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'generate_only' | 'generate_send'
          status: 'draft' | 'processing' | 'completed' | 'failed'
          total_certificates: number
          certificates_generated: number
          emails_sent: number
          csv_data: Json | null
          recipients_status: Json | null
          template_url: string | null
          template_data: string | null
          public_template_id: string | null
          private_template_id: string | null
          qr_code_settings: Json | null
          canvas_config: Json | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'generate_only' | 'generate_send'
          status?: 'draft' | 'processing' | 'completed' | 'failed'
          total_certificates?: number
          certificates_generated?: number
          emails_sent?: number
          csv_data?: Json | null
          recipients_status?: Json | null
          canvas_config?: Json | null
          template_url?: string | null
          template_data?: string | null
          public_template_id?: string | null
          private_template_id?: string | null
          qr_code_settings?: Json | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'generate_only' | 'generate_send'
          status?: 'draft' | 'processing' | 'completed' | 'failed'
          total_certificates?: number
          certificates_generated?: number
          emails_sent?: number
          csv_data?: Json | null
          recipients_status?: Json | null
          canvas_config?: Json | null
          template_url?: string | null
          template_data?: string | null
          public_template_id?: string | null
          private_template_id?: string | null
          qr_code_settings?: Json | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      certificates: {
        Row: {
          certificate_uuid: string
          campaign_id: string
          user_id: string
          recipient_data: Json
          recipient_name: string
          recipient_email: string | null
          verification_url: string | null
          status: 'generated' | 'sent' | 'viewed' | 'verified'
          created_at: string
          updated_at: string
          viewed_at: string | null
        }
        Insert: {
          certificate_uuid?: string
          campaign_id: string
          user_id: string
          recipient_data: Json
          recipient_name: string
          recipient_email?: string | null
          verification_url?: string | null
          status?: 'generated' | 'sent' | 'viewed' | 'verified'
          created_at?: string
          updated_at?: string
          viewed_at?: string | null
        }
        Update: {
          certificate_uuid?: string
          campaign_id?: string
          user_id?: string
          recipient_data?: Json
          recipient_name?: string
          recipient_email?: string | null
          verification_url?: string | null
          status?: 'generated' | 'sent' | 'viewed' | 'verified'
          created_at?: string
          updated_at?: string
          viewed_at?: string | null
        }
      }
      user_stats: {
        Row: {
          id: string
          user_id: string
          total_certificates_generated: number
          total_emails_sent: number
          total_campaigns: number
          success_rate: number
          updated_at: string
          total_templates_created: number
          plan_type: 'starter' | 'pro' | 'business' | 'enterprise'
          certificates_limit: number
          certificates_used_this_period: number
          period_start_date: string
        }
        Insert: {
          id?: string
          user_id: string
          total_certificates_generated?: number
          total_emails_sent?: number
          total_campaigns?: number
          success_rate?: number
          updated_at?: string
          total_templates_created?: number
          plan_type?: 'starter' | 'pro' | 'business' | 'enterprise'
          certificates_limit?: number
          certificates_used_this_period?: number
          period_start_date?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_certificates_generated?: number
          total_emails_sent?: number
          total_campaigns?: number
          success_rate?: number
          updated_at?: string
          total_templates_created?: number
          plan_type?: 'starter' | 'pro' | 'business' | 'enterprise'
          certificates_limit?: number
          certificates_used_this_period?: number
          period_start_date?: string
        }
      }
      public_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          html_content: string
          css_content: string | null
          thumbnail_url: string | null
          template_data: Json | null
          default_variables: Json | null
          usage_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string
          html_content: string
          css_content?: string | null
          thumbnail_url?: string | null
          template_data?: Json | null
          default_variables?: Json | null
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          html_content?: string
          css_content?: string | null
          thumbnail_url?: string | null
          template_data?: Json | null
          default_variables?: Json | null
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      private_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          category: string
          html_content: string
          css_content: string | null
          thumbnail_url: string | null
          template_data: Json | null
          default_variables: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          category?: string
          html_content: string
          css_content?: string | null
          thumbnail_url?: string | null
          template_data?: Json | null
          default_variables?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          category?: string
          html_content?: string
          css_content?: string | null
          thumbnail_url?: string | null
          template_data?: Json | null
          default_variables?: Json | null
          created_at?: string
          updated_at?: string
        }
      }

    }
  }
}
