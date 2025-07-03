'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from "@/store/authStore"

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const { checkAuth } = useAuthStore()
	const [isHydrated, setIsHydrated] = useState(false)
	const [authChecked, setAuthChecked] = useState(false)
	const pathname = usePathname()

	useEffect(() => {
		// First, rehydrate the store
		useAuthStore.persist.rehydrate()
		setIsHydrated(true)
	}, [])

	useEffect(() => {
		// Only check auth once after hydration and if not already checked
		if (isHydrated && !authChecked) {
			setAuthChecked(true)
			checkAuth()
		}
	}, [checkAuth, isHydrated, authChecked])

	if (!isHydrated) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
			</div>
		)
	}

	return <>{children}</>
}
