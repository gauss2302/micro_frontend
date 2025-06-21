'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, TrendingUp, Users, Zap } from 'lucide-react'
import { useAuthStore } from "@/store/authStore"
import { usePostStore } from "@/store/postStore"
import PostList from '@/components/post/PostList'

export default function HomePage() {
	const { isAuthenticated } = useAuthStore()
	const { stats, fetchStats } = usePostStore()
	const [isStatsLoading, setIsStatsLoading] = useState(true)

	useEffect(() => {
		const loadStats = async () => {
			try {
				await fetchStats()
			} finally {
				setIsStatsLoading(false)
			}
		}
		loadStats()
	}, [fetchStats])

	const features = [
		{
			icon: BookOpen,
			title: "Rich Writing Experience",
			description: "Focus on your content with our clean, distraction-free editor that supports Markdown formatting."
		},
		{
			icon: Users,
			title: "Growing Community",
			description: "Connect with writers and readers who share your passion for storytelling and knowledge sharing."
		},
		{
			icon: TrendingUp,
			title: "Discover Trending Content",
			description: "Find the most engaging stories and stay updated with what's trending in your areas of interest."
		},
		{
			icon: Zap,
			title: "Instant Publishing",
			description: "Share your thoughts with the world instantly, or save drafts for later refinement."
		}
	]

	return (
		<>
			{/* Hero Section */}
			<section className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
					<div className="text-center">
						<h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
							Share Your Stories
							<span className="block text-indigo-600">With the World</span>
						</h1>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
							Join thousands of writers and readers on BlogHub. Create, discover, and engage with content that matters.
						</p>

						{/* Stats */}
						<div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-8">
							{!isStatsLoading && stats && (
								<div className="flex gap-8 text-center">
									<div>
										<div className="text-2xl font-bold text-indigo-600">
											{stats.total_published_posts.toLocaleString()}
										</div>
										<div className="text-sm text-gray-600">Published Stories</div>
									</div>
									<div>
										<div className="text-2xl font-bold text-indigo-600">10K+</div>
										<div className="text-sm text-gray-600">Active Writers</div>
									</div>
									<div>
										<div className="text-2xl font-bold text-indigo-600">50K+</div>
										<div className="text-sm text-gray-600">Monthly Readers</div>
									</div>
								</div>
							)}
						</div>

						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							{isAuthenticated ? (
								<>
									<Link href="/write" className="btn-primary">
										Start Writing <ArrowRight className="ml-2 w-5 h-5" />
									</Link>
									<Link href="/dashboard" className="btn-secondary">
										Go to Dashboard
									</Link>
								</>
							) : (
								<>
									<Link href="/login" className="btn-primary">
										Get Started <ArrowRight className="ml-2 w-5 h-5" />
									</Link>
									<Link href="#featured" className="btn-secondary">
										Explore Stories
									</Link>
								</>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-16 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							Everything You Need to Tell Your Story
						</h2>
						<p className="text-lg text-gray-600 max-w-2xl mx-auto">
							From writing to publishing, we've built the tools you need to focus on what matters most: your content.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{features.map((feature, index) => (
							<div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
								<div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
									<feature.icon className="w-6 h-6 text-indigo-600" />
								</div>
								<h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
								<p className="text-gray-600">{feature.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Featured Posts Section */}
			<section id="featured" className="py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Stories</h2>
						<p className="text-lg text-gray-600">
							Discover the most engaging content from our community of writers.
						</p>
					</div>

					{/* Post List Component */}
					<div className="max-w-4xl mx-auto">
						<PostList
							published_only={true}
							showActions={false}
						/>
					</div>

					{/* Call to Action */}
					<div className="text-center mt-12">
						<Link
							href="/explore"
							className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
						>
							Explore All Stories
							<ArrowRight className="ml-2 w-5 h-5" />
						</Link>
					</div>
				</div>
			</section>

			{/* Call to Action Section */}
			{!isAuthenticated && (
				<section className="py-16 bg-indigo-600">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
						<h2 className="text-3xl font-bold text-white mb-4">
							Ready to Share Your Story?
						</h2>
						<p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
							Join our community of writers and start publishing your content today.
							It's free and takes less than a minute to get started.
						</p>
						<Link
							href="/login"
							className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-lg"
						>
							Join BlogHub Today
							<ArrowRight className="ml-2 w-5 h-5" />
						</Link>
					</div>
				</section>
			)}
		</>
	)
}
