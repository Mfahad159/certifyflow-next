import { supabase } from './supabaseClient'

export const storageService = {
  /**
   * Upload an image to Supabase Storage
   * @param {File | Blob} file 
   * @param {string} path - unique path (e.g., campaignId/assetName)
   * @returns {Promise<string>} - Public URL of the uploaded image
   */
  /**
   * Upload an image to Supabase Storage
   * @param {File | Blob} file 
   * @param {string} path - unique path
   * @returns {Promise<{path: string, signedUrl: string}>}
   */
  async uploadAsset(file, path) {
    const bucket = 'assets'

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
        cacheControl: '3600'
      })

    if (error) {
      if (error.message.includes('bucket not found')) {
        throw new Error('Please create a PRIVATE bucket named "assets" in Supabase.')
      }
      throw error
    }

    // Get a signed URL for immediate use in the editor (valid for 1 hour)
    const { data: { signedUrl }, error: signedError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(data.path, 3600)

    if (signedError) throw signedError

    return { path: data.path, signedUrl }
  },

  /**
   * Get a temporary signed URL for a specific asset path
   */
  async getSignedUrl(path, expiresIn = 3600) {
    const { data, error } = await supabase.storage
      .from('assets')
      .createSignedUrl(path, expiresIn)

    if (error) throw error
    return data.signedUrl
  }
}
