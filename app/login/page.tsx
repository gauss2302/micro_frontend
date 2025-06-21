'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {useAuthStore} from "@/store/authStore";

export default function LoginPage() {
	const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore()
	const router = useRouter()

	useEffect(() => {
		if (isAuthenticated) {
			router.push('/dashboard') // or wherever you want to redirect
		}
	}, [isAuthenticated, router])

	useEffect(() => {
		// Clear any previous errors when component mounts
		clearError()
	}, [clearError])

	const handleGoogleLogin = async () => {
		try {
			await login()
		} catch (error) {
			console.error('Login failed:', error)
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Sign in to your account
					</h2>
				</div>

				<div className="mt-8 space-y-6">
					{error && (
						<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
							{error}
						</div>
					)}

					<button
						onClick={handleGoogleLogin}
						disabled={isLoading}
						className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLoading ? 'Redirecting...' : 'Sign in with Google'}
					</button>
				</div>
			</div>
		</div>
	)
}
