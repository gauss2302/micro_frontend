// app/post/[slug]/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, User, Edit, ArrowLeft, Share, Eye } from 'lucide-react'
import { usePostStore } from '@/store/postStore'
import { useAuthStore } from '@/store/authStore'
import { apiClient } from '@/lib/api'

export default function PostDetailPage() {
	const params = useParams()
	const router = useRouter()
	const { currentPost, isLoading, error, fetchPostBySlug, clearCurrentPost } = usePostStore()
	const { user } = useAuthStore()
	const [authorName, setAuthorName] = useState<string>('')
	const [isLoadingAuthor, setIsLoadingAuthor] = useState(false)

	const slug = params.slug as string
	const isAuthor = currentPost?.user_id === user?.id

	// Debug logging
	useEffect(() => {
		console.log('PostDetailPage mounted with slug:', slug)
		console.log('Current URL:', window.location.href)
	}, [slug])

	useEffect(() => {
		if (slug) {
			console.log('Fetching post by slug:', slug)
			fetchPostBySlug(slug)
		}

		return () => {
			clearCurrentPost()
		}
	}, [slug, fetchPostBySlug, clearCurrentPost])

	// Fetch author name
	useEffect(() => {
		if (currentPost?.user_id) {
			setIsLoadingAuthor(true)
			apiClient.getUserProfile(currentPost.user_id)
				.then(profile => {
					setAuthorName(profile.name)
					console.log('Author loaded:', profile.name)
				})
				.catch((error) => {
					console.error('Failed to fetch author:', error)
					setAuthorName('Unknown Author')
				})
				.finally(() => {
					setIsLoadingAuthor(false)
				})
		}
	}, [currentPost?.user_id])

	const formatDate = (dateString: string) => {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		}).format(new Date(dateString))
	}

	const handleShare = async () => {
		if (navigator.share && currentPost) {
			try {
				await navigator.share({
					title: currentPost.title,
					url: window.location.href,
				})
			} catch (error) {
				// Fallback to clipboard
				await navigator.clipboard.writeText(window.location.href)
				alert('Link copied to clipboard!')
			}
		} else {
			// Fallback to clipboard
			try {
				await navigator.clipboard.writeText(window.location.href)
				alert('Link copied to clipboard!')
			} catch (error) {
				console.error('Failed to copy to clipboard:', error)
			}
		}
	}

	const formatContent = (content: string) => {
		// Simple markdown-like formatting
		return content
			.split('\n\n')
			.map((paragraph, index) => (
				<p key={index} className="mb-6 leading-relaxed text-gray-800">
					{paragraph.split('\n').map((line, lineIndex) => (
						<React.Fragment key={lineIndex}>
							{line}
							{lineIndex < paragraph.split('\n').length - 1 && <br />}
						</React.Fragment>
					))}
				</p>
			))
	}

	// Debug current state
	console.log('PostDetailPage state:', {
		slug,
		isLoading,
		error,
		hasPost: !!currentPost,
		postTitle: currentPost?.title,
		isAuthor
	})

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<div className="max-w-4xl mx-auto px-4 py-8">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded mb-4 w-3/4"></div>
						<div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
						<div className="h-4 bg-gray-200 rounded mb-8 w-1/3"></div>
						<div className="space-y-3">
							<div className="h-4 bg-gray-200 rounded"></div>
							<div className="h-4 bg-gray-200 rounded w-5/6"></div>
							<div className="h-4 bg-gray-200 rounded w-4/6"></div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (error || !currentPost) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="max-w-md mx-auto text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
					<p className="text-gray-600 mb-6">
						{error || 'The post you\'re looking for doesn\'t exist or has been removed.'}
					</p>
					<div className="space-y-3">
						<Link
							href="/"
							className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
						>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Home
						</Link>
						<div>
							<Link
								href="/explore"
								className="text-indigo-600 hover:text-indigo-700 text-sm"
							>
								Explore other posts →
							</Link>
						</div>
					</div>
				</div>
			</div>
		)
	}

	// Check if user can view this post
	if (!currentPost.published && !isAuthor) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="max-w-md mx-auto text-center">
					<Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
					<h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Available</h1>
					<p className="text-gray-600 mb-6">
						This post is not published yet or is no longer available.
					</p>
					<Link
						href="/"
						className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Home
					</Link>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Debug info (remove in production) */}
			<div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 text-sm">
				<strong>Debug:</strong> Viewing post "{currentPost.title}" (slug: {slug})
			</div>

			<div className="max-w-4xl mx-auto px-4 py-8">
				{/* Back Button */}
				<button
					onClick={() => router.back()}
					className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back
				</button>

				{/* Article Header */}
				<header className="mb-8">
					<h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
						{currentPost.title}
					</h1>

					<div className="flex items-center justify-between flex-wrap gap-4">
						<div className="flex items-center space-x-6 text-gray-600">
							<div className="flex items-center">
								<User className="w-4 h-4 mr-2" />
								<span>
									{isLoadingAuthor ? 'Loading...' : authorName}
								</span>
							</div>
							<div className="flex items-center">
								<Calendar className="w-4 h-4 mr-2" />
								<span>{formatDate(currentPost.created_at)}</span>
							</div>
							{currentPost.updated_at !== currentPost.created_at && (
								<div className="text-sm text-gray-500">
									Updated {formatDate(currentPost.updated_at)}
								</div>
							)}
						</div>

						<div className="flex items-center space-x-3">
							<button
								onClick={handleShare}
								className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
							>
								<Share className="w-4 h-4 mr-2" />
								Share
							</button>

							{isAuthor && (
								<Link
									href={`/post/${currentPost.slug}/edit`}
									className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
								>
									<Edit className="w-4 h-4 mr-2" />
									Edit Post
								</Link>
							)}
						</div>
					</div>

					{!currentPost.published && isAuthor && (
						<div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
							<p className="text-yellow-800 text-sm">
								<strong>Draft:</strong> This post is not published yet. Only you can see it.
							</p>
						</div>
					)}
				</header>

				{/* Article Content */}
				<article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
					<div className="prose prose-lg max-w-none">
						<div className="text-lg leading-relaxed">
							{formatContent(currentPost.content)}
						</div>
					</div>
				</article>

				{/* Author Card */}
				{authorName && !isLoadingAuthor && (
					<div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">About the Author</h3>
						<div className="flex items-center space-x-4">
							<div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
								{authorName.charAt(0).toUpperCase()}
							</div>
							<div>
								<h4 className="font-medium text-gray-900">{authorName}</h4>
								<p className="text-sm text-gray-600">
									Writer and storyteller
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Navigation */}
				<div className="flex justify-between items-center">
					<Link
						href="/explore"
						className="inline-flex items-center text-indigo-600 hover:text-indigo-700 transition-colors"
					>
						← Explore more stories
					</Link>

					{isAuthor && (
						<Link
							href="/dashboard"
							className="inline-flex items-center text-indigo-600 hover:text-indigo-700 transition-colors"
						>
							Go to Dashboard →
						</Link>
					)}
				</div>
			</div>
		</div>
	)
}
