// components/auth/ProtectedRoute.tsx - Updated version
'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {useAuthStore} from "@/store/authStore";

interface ProtectedRouteProps {
	children: React.ReactNode
	redirectTo?: string
	requireAuth?: boolean
}

export function ProtectedRoute({
								   children,
								   redirectTo = '/login',
								   requireAuth = true
							   }: ProtectedRouteProps) {
	const { isAuthenticated, isLoading } = useAuthStore()
	const router = useRouter()

	useEffect(() => {
		if (requireAuth && !isLoading && !isAuthenticated) {
			router.push(redirectTo)
		}
	}, [isAuthenticated, isLoading, router, redirectTo, requireAuth])

	// Show loading while checking auth
	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		)
	}

	// If auth is required but user is not authenticated, don't render children
	if (requireAuth && !isAuthenticated) {
		return null
	}

	return <>{children}</>
}
