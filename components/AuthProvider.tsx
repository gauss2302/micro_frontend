'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import {useAuthStore} from "@/store/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const { checkAuth } = useAuthStore()
	const [isHydrated, setIsHydrated] = useState(false)
	const pathname = usePathname()

	useEffect(() => {
		useAuthStore.persist.rehydrate()
		setIsHydrated(true)
	}, [])

	useEffect(() => {
		if (isHydrated) {
			checkAuth()
		}
	}, [checkAuth, isHydrated])

	if (!isHydrated) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
			</div>
		)
	}

	return <>{children}</>
}
