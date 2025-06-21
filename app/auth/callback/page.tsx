'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {useAuthStore} from "@/store/authStore";

export default function AuthCallbackPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { handleCallback, error, isLoading } = useAuthStore()

	useEffect(() => {
		const authCode = searchParams.get('auth_code')
		const errorParam = searchParams.get('error')

		if (errorParam) {
			router.push(`/login?error=${encodeURIComponent(errorParam)}`)
			return
		}

		if (authCode) {
			handleCallback(authCode)
				.then(() => {
					router.push('/dashboard')
				})
				.catch((error) => {
					console.error('Auth callback failed:', error)
					router.push('/login?error=callback_failed')
				})
		} else {
			router.push('/login?error=no_auth_code')
		}
	}, [searchParams, handleCallback, router])

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full space-y-8 text-center">
				{isLoading ? (
					<>
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
						<h2 className="text-xl font-semibold text-gray-900">
							Completing authentication...
						</h2>
					</>
				) : error ? (
					<>
						<h2 className="text-xl font-semibold text-red-600">
							Authentication Failed
						</h2>
						<p className="text-gray-600">{error}</p>
						<button
							onClick={() => router.push('/login')}
							className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
						>
							Back to Login
						</button>
					</>
				) : null}
			</div>
		</div>
	)
}
