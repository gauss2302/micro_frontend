'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, PenTool, Plus, Bell, User, Settings, LogOut } from 'lucide-react'
import {useAuthStore} from "@/store/authStore";

export function Header() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
	const { user, isAuthenticated, logout } = useAuthStore()
	const router = useRouter()

	const handleLogout = async () => {
		try {
			await logout()
			router.push('/')
		} catch (error) {
			console.error('Logout failed:', error)
		}
	}

	return (
		<header className="bg-white shadow-sm border-b border-gray-200">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<Link href="/" className="flex items-center space-x-2">
						<div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
							<PenTool className="w-5 h-5 text-white" />
						</div>
						<span className="text-xl font-bold text-gray-900">BlogHub</span>
					</Link>

					{/* Navigation & User Menu */}
					<div className="flex items-center space-x-4">
						{isAuthenticated ? (
							<>
								<Link href="/write" className="btn-primary hidden sm:flex">
									<Plus className="w-4 h-4 mr-2" />
									Write
								</Link>

								<button className="p-2 text-gray-400 hover:text-gray-600 relative">
									<Bell className="w-5 h-5" />
									<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
								</button>

								{/* Profile Menu */}
								<div className="relative">
									<button
										onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
										className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100"
									>
										<img
											className="w-8 h-8 rounded-full"
											src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff`}
											alt={user?.name || 'User'}
										/>
									</button>

									{isProfileMenuOpen && (
										<div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
											<div className="px-4 py-2 border-b border-gray-100">
												<p className="text-sm font-medium text-gray-900">{user?.name}</p>
												<p className="text-sm text-gray-500">{user?.email}</p>
											</div>

											<Link href="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
												<User className="w-4 h-4 mr-3" />
												Dashboard
											</Link>

											<Link href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
												<Settings className="w-4 h-4 mr-3" />
												Settings
											</Link>

											<button
												onClick={handleLogout}
												className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
											>
												<LogOut className="w-4 h-4 mr-3" />
												Sign out
											</button>
										</div>
									)}
								</div>
							</>
						) : (
							<div className="flex items-center space-x-3">
								<Link href="/login" className="text-gray-600 hover:text-gray-900">
									Sign in
								</Link>
								<Link href="/login" className="btn-primary">
									Get started
								</Link>
							</div>
						)}

						{/* Mobile menu button */}
						<button
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
						>
							{isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			{isMobileMenuOpen && (
				<div className="md:hidden border-t border-gray-200">
					<div className="px-2 pt-2 pb-3 space-y-1">
						<Link href="/" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
							Home
						</Link>
						<Link href="/explore" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
							Explore
						</Link>
						{isAuthenticated && (
							<Link href="/write" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
								Write
							</Link>
						)}
					</div>
				</div>
			)}
		</header>
	)
}
