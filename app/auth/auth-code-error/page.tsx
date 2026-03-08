"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader } from '@/components/ui/loader'

export default function AuthCodeError() {
    const router = useRouter()

    useEffect(() => {
        toast.error('Authentication failed. Please try again.')
        const timer = setTimeout(() => {
            router.push('/')
        }, 3000)
        return () => clearTimeout(timer)
    }, [router])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
            <div className="max-w-md w-full p-8 rounded-[40px] bg-zinc-900/60 border border-white/10 backdrop-blur-3xl">
                <h1 className="text-3xl font-serif text-white mb-4">Auth Error</h1>
                <p className="text-zinc-500 mb-8 font-sans">
                    There was an issue verifying your login. Redirecting you back home...
                </p>
                <Loader size={40} color="#6b55fd" className="mx-auto" />
            </div>
        </div>
    )
}
