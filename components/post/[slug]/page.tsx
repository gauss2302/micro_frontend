// app/post/[slug]/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, User, Edit, ArrowLeft, Share } from 'lucide-react'
import { usePostStore } from '@/store/postStore'
import { useAuthStore } from '@/store/authStore'
import { apiClient } from '@/lib/api'

export default function PostDetailPage() {
	const params = useParams()
	const router = useRouter()
	const { currentPost, isLoading, error, fetchPostBySlug, clearCurrentPost } = usePostStore()
	const { user } = useAuthStore()
	const [authorName, setAuthorName] = useState<string>('')

	const slug = params.slug as string
	const isAuthor = currentPost?.user_id === user?.id

	useEffect(() => {
		if (slug) {
			fetchPostBySlug(slug)
		}

		return () => {
			clearCurrentPost()
		}
	}, [slug, fetchPostBySlug, clearCurrentPost])

	// Fetch author name
	useEffect(() => {
		if (currentPost?.user_id) {
			apiClient.getUserProfile(currentPost.user_id)
				.then(profile => setAuthorName(profile.name))
				.catch(() => setAuthorName('Unknown Author'))
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
			await navigator.clipboard.writeText(window.location.href)
			alert('Link copied to clipboard!')
		}
	}

	const formatContent = (content: string) => {
		// Simple markdown-like formatting
		return content
			.split('\n\n')
			.map((paragraph, index) => (
				<p key={index} className="mb-4 leading-relaxed">
					{paragraph}
				</p>
			))
	}

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
					<Link
						href="/"
						className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
			<div className="max-w-4xl mx-auto px-4 py-8">
				{/* Back Button */}
				<button
					onClick={() => router.back()}
					className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
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
								<span>{authorName || 'Loading...'}</span>
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
				<article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
					<div className="prose prose-lg max-w-none">
						<div className="text-gray-800 text-lg leading-relaxed">
							{formatContent(currentPost.content)}
						</div>
					</div>
				</article>

				{/* Author Card */}
				{authorName && (
					<div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">About the Author</h3>
						<div className="flex items-center space-x-4">
							<div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
								{authorName.charAt(0).toUpperCase()}
							</div>
							<div>
								<h4 className="font-medium text-gray-900">{authorName}</h4>
								<Link
									href={`/user/${currentPost.user_id}`}
									className="text-indigo-600 hover:text-indigo-700 text-sm"
								>
									View all posts →
								</Link>
							</div>
						</div>
					</div>
				)}

				{/* Related Posts could go here */}
			</div>
		</div>
	)
}
