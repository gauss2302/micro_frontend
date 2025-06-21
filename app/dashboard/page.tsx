"use client";

import Head from 'next/head'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import {AuthProvider} from "@/components/AuthProvider";
import {useState} from "react";

export default function Dashboard() {
	const router = useRouter()
	const { user, logout, isLoading } = useAuthStore()
	const [isLoggingOut, setIsLoggingOut] = useState(false)

	const handleLogout = async () => {
		setIsLoggingOut(true)
		try {
			await logout()
			router.push('/login')
		} catch (error) {
			console.error('Logout failed:', error)
			setIsLoggingOut(false)
		}
	}

	return (
		<AuthProvider>
			<Head>
				<title>Dashboard - Microservices Auth</title>
				<meta name="description" content="User dashboard" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>

			<div className="min-h-screen bg-gray-50">
				{/* Navigation */}
				<nav className="bg-white shadow-sm border-b border-gray-200">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex justify-between h-16">
							<div className="flex items-center">
								<div className="flex-shrink-0 flex items-center">
									<div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
										<svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M13 10V3L4 14h7v7l9-11h-7z"
											/>
										</svg>
									</div>
									<span className="ml-3 text-xl font-semibold text-gray-900">Dashboard</span>
								</div>
							</div>

							<div className="flex items-center space-x-4">
								{user && (
									<div className="flex items-center space-x-3">
										{user.picture && (
											<img
												className="h-8 w-8 rounded-full"
												src={user.picture}
												alt={user.name}
											/>
										)}
										<span className="text-sm font-medium text-gray-700">{user.name}</span>
									</div>
								)}

								<button
									onClick={handleLogout}
									disabled={isLoggingOut}
									className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isLoggingOut ? (
										<>
											<div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
											Signing out...
										</>
									) : (
										'Sign out'
									)}
								</button>
							</div>
						</div>
					</div>
				</nav>

				{/* Main content */}
				<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
					<div className="px-4 py-6 sm:px-0">
						{/* Welcome section */}
						<div className="bg-white overflow-hidden shadow rounded-lg mb-6">
							<div className="px-4 py-5 sm:p-6">
								<h1 className="text-2xl font-bold text-gray-900 mb-2">
									Welcome back, {user?.name}!
								</h1>
								<p className="text-gray-600">
									You have successfully authenticated with our microservices architecture.
								</p>
							</div>
						</div>

						{/* User info card */}
						<div className="bg-white overflow-hidden shadow rounded-lg mb-6">
							<div className="px-4 py-5 sm:p-6">
								<h2 className="text-lg font-medium text-gray-900 mb-4">User Information</h2>
								<dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
									<div>
										<dt className="text-sm font-medium text-gray-500">User ID</dt>
										<dd className="mt-1 text-sm text-gray-900 font-mono">{user?.id}</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">Email</dt>
										<dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">Full Name</dt>
										<dd className="mt-1 text-sm text-gray-900">{user?.name}</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">Profile Picture</dt>
										<dd className="mt-1">
											{user?.picture ? (
												<img
													className="h-10 w-10 rounded-full"
													src={user.picture}
													alt={user.name}
												/>
											) : (
												<span className="text-sm text-gray-500">No picture</span>
											)}
										</dd>
									</div>
								</dl>
							</div>
						</div>

						{/* System status */}
						<div className="bg-white overflow-hidden shadow rounded-lg">
							<div className="px-4 py-5 sm:p-6">
								<h2 className="text-lg font-medium text-gray-900 mb-4">System Status</h2>
								<div className="space-y-3">
									<div className="flex items-center">
										<div className="flex-shrink-0">
											<div className="h-2 w-2 bg-green-400 rounded-full"></div>
										</div>
										<div className="ml-3">
											<p className="text-sm text-gray-900">API Gateway</p>
											<p className="text-xs text-gray-500">Connected and operational</p>
										</div>
									</div>
									<div className="flex items-center">
										<div className="flex-shrink-0">
											<div className="h-2 w-2 bg-green-400 rounded-full"></div>
										</div>
										<div className="ml-3">
											<p className="text-sm text-gray-900">Auth Service</p>
											<p className="text-xs text-gray-500">Authentication successful</p>
										</div>
									</div>
									<div className="flex items-center">
										<div className="flex-shrink-0">
											<div className="h-2 w-2 bg-green-400 rounded-full"></div>
										</div>
										<div className="ml-3">
											<p className="text-sm text-gray-900">User Service</p>
											<p className="text-xs text-gray-500">User data loaded</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>
		</AuthProvider>
	)
}
