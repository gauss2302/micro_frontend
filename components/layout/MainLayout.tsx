// // components/layout/MainLayout.tsx
// 'use client'
//
// import React, { useState } from 'react'
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'
// import {
// 	Menu,
// 	X,
// 	Home,
// 	PenTool,
// 	User,
// 	Search,
// 	Bell,
// 	Settings,
// 	LogOut,
// 	Plus
// } from 'lucide-react'
// import {useAuthStore} from "@/store/authStore";
//
// interface MainLayoutProps {
// 	children: React.ReactNode
// }
//
// export default function MainLayout({ children }: MainLayoutProps) {
// 	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
// 	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
// 	const { user, isAuthenticated, logout } = useAuthStore()
// 	const router = useRouter()
//
// 	const handleLogout = async () => {
// 		try {
// 			await logout()
// 			router.push('/')
// 		} catch (error) {
// 			console.error('Logout failed:', error)
// 		}
// 	}
//
// 	const navigation = [
// 		{ name: 'Home', href: '/', icon: Home },
// 		{ name: 'Explore', href: '/explore', icon: Search },
// 		{ name: 'Write', href: '/write', icon: PenTool, authRequired: true },
// 	]
//
// 	return (
// 		<div className="min-h-screen bg-gray-50">
// 			{/* Header */}
// 			<header className="bg-white shadow-sm border-b border-gray-200">
// 				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// 					<div className="flex justify-between items-center h-16">
// 						{/* Logo */}
// 						<div className="flex items-center">
// 							<Link href="/" className="flex items-center space-x-2">
// 								<div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
// 									<PenTool className="w-5 h-5 text-white" />
// 								</div>
// 								<span className="text-xl font-bold text-gray-900">BlogHub</span>
// 							</Link>
// 						</div>
//
// 						{/* Desktop Navigation */}
// 						<nav className="hidden md:flex items-center space-x-8">
// 							{navigation.map((item) => {
// 								if (item.authRequired && !isAuthenticated) return null
// 								return (
// 									<Link
// 										key={item.name}
// 										href={item.href}
// 										className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
// 									>
// 										<item.icon className="w-4 h-4" />
// 										<span>{item.name}</span>
// 									</Link>
// 								)
// 							})}
// 						</nav>
//
// 						{/* Right side */}
// 						<div className="flex items-center space-x-4">
// 							{isAuthenticated ? (
// 								<>
// 									{/* Write Button */}
// 									<Link
// 										href="/write"
// 										className="hidden sm:flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
// 									>
// 										<Plus className="w-4 h-4" />
// 										<span>Write</span>
// 									</Link>
//
// 									{/* Notifications */}
// 									<button className="p-2 text-gray-400 hover:text-gray-600 relative">
// 										<Bell className="w-5 h-5" />
// 										<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
// 									</button>
//
// 									{/* Profile Menu */}
// 									<div className="relative">
// 										<button
// 											onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
// 											className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100"
// 										>
// 											<img
// 												className="w-8 h-8 rounded-full"
// 												src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff`}
// 												alt={user?.name || 'User'}
// 											/>
// 										</button>
//
// 										{/* Profile Dropdown */}
// 										{isProfileMenuOpen && (
// 											<div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
// 												<div className="px-4 py-2 border-b border-gray-100">
// 													<p className="text-sm font-medium text-gray-900">{user?.name}</p>
// 													<p className="text-sm text-gray-500">{user?.email}</p>
// 												</div>
//
// 												<Link
// 													href="/profile"
// 													className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
// 													onClick={() => setIsProfileMenuOpen(false)}
// 												>
// 													<User className="w-4 h-4 mr-3" />
// 													Your Profile
// 												</Link>
//
// 												<Link
// 													href="/dashboard"
// 													className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
// 													onClick={() => setIsProfileMenuOpen(false)}
// 												>
// 													<PenTool className="w-4 h-4 mr-3" />
// 													Your Posts
// 												</Link>
//
// 												<Link
// 													href="/settings"
// 													className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
// 													onClick={() => setIsProfileMenuOpen(false)}
// 												>
// 													<Settings className="w-4 h-4 mr-3" />
// 													Settings
// 												</Link>
//
// 												<button
// 													onClick={handleLogout}
// 													className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
// 												>
// 													<LogOut className="w-4 h-4 mr-3" />
// 													Sign out
// 												</button>
// 											</div>
// 										)}
// 									</div>
// 								</>
// 							) : (
// 								<div className="flex items-center space-x-3">
// 									<Link
// 										href="/login"
// 										className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
// 									>
// 										Sign in
// 									</Link>
// 									<Link
// 										href="/login"
// 										className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
// 									>
// 										Get started
// 									</Link>
// 								</div>
// 							)}
//
// 							{/* Mobile menu button */}
// 							<button
// 								onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
// 								className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
// 							>
// 								{isMobileMenuOpen ? (
// 									<X className="w-6 h-6" />
// 								) : (
// 									<Menu className="w-6 h-6" />
// 								)}
// 							</button>
// 						</div>
// 					</div>
// 				</div>
//
// 				{/* Mobile menu */}
// 				{isMobileMenuOpen && (
// 					<div className="md:hidden">
// 						<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
// 							{navigation.map((item) => {
// 								if (item.authRequired && !isAuthenticated) return null
// 								return (
// 									<Link
// 										key={item.name}
// 										href={item.href}
// 										className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium"
// 										onClick={() => setIsMobileMenuOpen(false)}
// 									>
// 										<item.icon className="w-5 h-5" />
// 										<span>{item.name}</span>
// 									</Link>
// 								)
// 							})}
//
// 							{isAuthenticated && (
// 								<Link
// 									href="/write"
// 									className="flex items-center space-x-3 bg-indigo-600 text-white px-3 py-2 rounded-md text-base font-medium sm:hidden"
// 									onClick={() => setIsMobileMenuOpen(false)}
// 								>
// 									<Plus className="w-5 h-5" />
// 									<span>Write</span>
// 								</Link>
// 							)}
// 						</div>
// 					</div>
// 				)}
// 			</header>
//
// 			{/* Main Content */}
// 			<main className="flex-1">
// 				{children}
// 			</main>
//
// 			{/* Footer */}
// 			<footer className="bg-white border-t border-gray-200 mt-16">
// 				<div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
// 					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
// 						<div className="col-span-1 md:col-span-2">
// 							<div className="flex items-center space-x-2 mb-4">
// 								<div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
// 									<PenTool className="w-5 h-5 text-white" />
// 								</div>
// 								<span className="text-xl font-bold text-gray-900">BlogHub</span>
// 							</div>
// 							<p className="text-gray-600 max-w-md">
// 								A modern platform for writers and readers to share stories, insights, and ideas.
// 								Join our community of passionate creators.
// 							</p>
// 						</div>
//
// 						<div>
// 							<h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
// 								Platform
// 							</h3>
// 							<ul className="space-y-2">
// 								<li><Link href="/explore" className="text-gray-600 hover:text-gray-900">Explore</Link></li>
// 								<li><Link href="/trending" className="text-gray-600 hover:text-gray-900">Trending</Link></li>
// 								<li><Link href="/tags" className="text-gray-600 hover:text-gray-900">Topics</Link></li>
// 							</ul>
// 						</div>
//
// 						<div>
// 							<h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
// 								Company
// 							</h3>
// 							<ul className="space-y-2">
// 								<li><Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link></li>
// 								<li><Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link></li>
// 								<li><Link href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy</Link></li>
// 								<li><Link href="/terms" className="text-gray-600 hover:text-gray-900">Terms</Link></li>
// 							</ul>
// 						</div>
// 					</div>
//
// 					<div className="mt-8 pt-8 border-t border-gray-200">
// 						<p className="text-center text-gray-400 text-sm">
// 							© 2024 BlogHub. All rights reserved.
// 						</p>
// 					</div>
// 				</div>
// 			</footer>
// 		</div>
// 	)
// }
