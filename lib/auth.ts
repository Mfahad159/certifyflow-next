"use client"

import { createClient as createBrowserClient } from '@/lib/supabase/client'

export async function loginWithGoogle() {
    const supabase = createBrowserClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
    })

    if (error) {
        console.error('Error logging in with Google:', error.message)
        throw error
    }

    return data
}

/**
 * Logs out the current user.
 * Note: Must be called from a Client Component or browser context.
 */
export async function logout() {
    const supabase = createBrowserClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('Error logging out:', error.message)
        throw error
    }
}

