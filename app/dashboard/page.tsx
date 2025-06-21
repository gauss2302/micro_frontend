// app/dashboard/page.tsx
"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, BarChart3, FileText, Eye, Edit, Calendar, TrendingUp } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { usePostStore } from '@/store/postStore'
import { AuthProvider } from "@/components/AuthProvider"
import PostList from '@/components/post/PostList'

export default function Dashboard() {
	const router = useRouter()
	const { user, logout, isLoading } = useAuthStore()
	const { userPosts, stats, fetchUserPosts, fetchStats } = usePostStore()
	const [isLoggingOut, setIsLoggingOut] = useState(false)
	const [activeTab, setActiveTab] = useState<'all' | 'published' | 'drafts'>('all')

	useEffect(() => {
		if (user) {
			fetchUserPosts(user.id)
			fetchStats()
		}
	}, [user, fetchUserPosts, fetchStats])

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

	const publishedPosts = userPosts.filter(post => post.published)
	const draftPosts = userPosts.filter(post => !post.published)

	const getFilteredPosts = () => {
		switch (activeTab) {
			case 'published':
				return publishedPosts
			case 'drafts':
				return draftPosts
			default:
				return userPosts
		}
	}

	const filteredPosts = getFilteredPosts()

	return (
		<AuthProvider>
			<div className="min-h-screen bg-gray-50">
				{/* Header */}
				<div className="bg-white shadow-sm border-b border-gray-200">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex justify-between items-center h-16">
							<div className="flex items-center">
								<Link href="/" className="flex items-center space-x-2">
									<div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
										<FileText className="h-5 w-5 text-white" />
									</div>
									<span className="text-xl font-semibold text-gray-900">Dashboard</span>
								</Link>
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
									className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
				</div>

				{/* Main Content */}
				<main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
					{/* Welcome Section */}
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							Welcome back, {user?.name}!
						</h1>
						<p className="text-gray-600">
							Manage your posts and track your writing progress.
						</p>
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<div className="flex items-center">
								<div className="p-2 bg-indigo-100 rounded-lg">
									<FileText className="w-6 h-6 text-indigo-600" />
								</div>
								<div className="ml-4">
									<p className="text-sm font-medium text-gray-600">Total Posts</p>
									<p className="text-2xl font-bold text-gray-900">{userPosts.length}</p>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<div className="flex items-center">
								<div className="p-2 bg-green-100 rounded-lg">
									<Eye className="w-6 h-6 text-green-600" />
								</div>
								<div className="ml-4">
									<p className="text-sm font-medium text-gray-600">Published</p>
									<p className="text-2xl font-bold text-gray-900">{publishedPosts.length}</p>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<div className="flex items-center">
								<div className="p-2 bg-yellow-100 rounded-lg">
									<Edit className="w-6 h-6 text-yellow-600" />
								</div>
								<div className="ml-4">
									<p className="text-sm font-medium text-gray-600">Drafts</p>
									<p className="text-2xl font-bold text-gray-900">{draftPosts.length}</p>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<div className="flex items-center">
								<div className="p-2 bg-purple-100 rounded-lg">
									<TrendingUp className="w-6 h-6 text-purple-600" />
								</div>
								<div className="ml-4">
									<p className="text-sm font-medium text-gray-600">This Month</p>
									<p className="text-2xl font-bold text-gray-900">
										{userPosts.filter(post => {
											const postDate = new Date(post.created_at)
											const now = new Date()
											return postDate.getMonth() === now.getMonth() &&
												postDate.getFullYear() === now.getFullYear()
										}).length}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Quick Actions */}
					<div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<Link
								href="/write"
								className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
							>
								<div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
									<Plus className="w-5 h-5 text-indigo-600" />
								</div>
								<div className="ml-3">
									<p className="font-medium text-gray-900">Write New Post</p>
									<p className="text-sm text-gray-600">Start a new story</p>
								</div>
							</Link>

							<Link
								href="/explore"
								className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
							>
								<div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
									<Eye className="w-5 h-5 text-indigo-600" />
								</div>
								<div className="ml-3">
									<p className="font-medium text-gray-900">Explore Posts</p>
									<p className="text-sm text-gray-600">Discover new content</p>
								</div>
							</Link>

							<Link
								href="/settings"
								className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
							>
								<div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
									<BarChart3 className="w-5 h-5 text-indigo-600" />
								</div>
								<div className="ml-3">
									<p className="font-medium text-gray-900">Analytics</p>
									<p className="text-sm text-gray-600">View your stats</p>
								</div>
							</Link>
						</div>
					</div>

					{/* Posts Section */}
					<div className="bg-white rounded-lg border border-gray-200">
						<div className="border-b border-gray-200 px-6 py-4">
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-semibold text-gray-900">Your Posts</h2>
								<Link
									href="/write"
									className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
								>
									<Plus className="w-4 h-4 mr-2" />
									New Post
								</Link>
							</div>

							{/* Tabs */}
							<div className="mt-4">
								<nav className="flex space-x-8">
									<button
										onClick={() => setActiveTab('all')}
										className={`py-2 px-1 border-b-2 font-medium text-sm ${
											activeTab === 'all'
												? 'border-indigo-500 text-indigo-600'
												: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
										}`}
									>
										All Posts ({userPosts.length})
									</button>
									<button
										onClick={() => setActiveTab('published')}
										className={`py-2 px-1 border-b-2 font-medium text-sm ${
											activeTab === 'published'
												? 'border-indigo-500 text-indigo-600'
												: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
										}`}
									>
										Published ({publishedPosts.length})
									</button>
									<button
										onClick={() => setActiveTab('drafts')}
										className={`py-2 px-1 border-b-2 font-medium text-sm ${
											activeTab === 'drafts'
												? 'border-indigo-500 text-indigo-600'
												: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
										}`}
									>
										Drafts ({draftPosts.length})
									</button>
								</nav>
							</div>
						</div>

						<div className="p-6">
							{user && (
								<PostList
									userId={user.id}
									showActions={true}
									published_only={false}
								/>
							)}
						</div>
					</div>
				</main>
			</div>
		</AuthProvider>
	)
}
