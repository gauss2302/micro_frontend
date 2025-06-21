'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, User, Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import { usePostStore } from '@/store/postStore'
import { useAuthStore } from '@/store/authStore'
import { PostSummary } from '@/lib/api'

interface PostListProps {
	userId?: string
	showActions?: boolean
	published_only?: boolean
	searchQuery?: string
}

export default function PostList({
									 userId,
									 showActions = false,
									 published_only = true,
									 searchQuery
								 }: PostListProps) {
	const {
		posts,
		userPosts,
		isLoading,
		error,
		hasMore,
		fetchPosts,
		fetchUserPosts,
		searchPosts,
		deletePost,
		clearError
	} = usePostStore()

	const { user } = useAuthStore()
	const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
	const [loadingMore, setLoadingMore] = useState(false)

	const currentPosts = userId ? userPosts : posts
	const isOwnPosts = userId === user?.id

	useEffect(() => {
		clearError()

		if (searchQuery) {
			searchPosts(searchQuery, { published_only, offset: 0 })
		} else if (userId) {
			fetchUserPosts(userId, { offset: 0 })
		} else {
			fetchPosts({ published_only, offset: 0 })
		}
	}, [userId, published_only, searchQuery])

	const loadMore = async () => {
		if (isLoading || loadingMore || !hasMore) return

		setLoadingMore(true)
		const offset = currentPosts.length

		try {
			if (searchQuery) {
				await searchPosts(searchQuery, { published_only, offset })
			} else if (userId) {
				await fetchUserPosts(userId, { offset })
			} else {
				await fetchPosts({ published_only, offset })
			}
		} finally {
			setLoadingMore(false)
		}
	}

	const handleDelete = async (postId: string) => {
		try {
			await deletePost(postId)
			setShowDeleteModal(null)
		} catch (error) {
			// Error handling is done in the store
		}
	}

	const formatDate = (dateString: string) => {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		}).format(new Date(dateString))
	}

	if (isLoading && currentPosts.length === 0) {
		return (
			<div className="space-y-4">
				{[...Array(3)].map((_, i) => (
					<div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
						<div className="h-6 bg-gray-200 rounded mb-3"></div>
						<div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
						<div className="h-4 bg-gray-200 rounded w-1/2"></div>
					</div>
				))}
			</div>
		)
	}

	if (error) {
		return (
			<div className="text-center py-12">
				<div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
					<h3 className="text-red-800 font-medium mb-2">Failed to load posts</h3>
					<p className="text-red-600 text-sm mb-4">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
					>
						Try Again
					</button>
				</div>
			</div>
		)
	}

	if (currentPosts.length === 0 && !isLoading) {
		return (
			<div className="text-center py-12">
				<div className="max-w-md mx-auto">
					<Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						{searchQuery ? 'No posts found' : 'No posts yet'}
					</h3>
					<p className="text-gray-600 mb-6">
						{searchQuery
							? `No posts match "${searchQuery}". Try different keywords.`
							: userId
								? 'This user hasn\'t published any posts yet.'
								: 'Be the first to share your story!'
						}
					</p>
					{!userId && !searchQuery && user && (
						<Link
							href="/write"
							className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
						>
							Write your first post
						</Link>
					)}
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Posts List */}
			<div className="space-y-4">
				{currentPosts.map((post) => (
					<article
						key={post.id}
						className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
					>
						<div className="p-6">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<Link href={`/post/${post.slug}`}>
										<h2 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors mb-2">
											{post.title}
										</h2>
									</Link>

									<div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
										<div className="flex items-center">
											<Calendar className="w-4 h-4 mr-1" />
											{formatDate(post.created_at)}
										</div>
										{post.updated_at !== post.created_at && (
											<span className="text-xs">Updated {formatDate(post.updated_at)}</span>
										)}
										{!post.published && (
											<span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
												Draft
											</span>
										)}
									</div>

									<div className="flex items-center justify-between">
										<Link
											href={`/post/${post.slug}`}
											className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
										>
											Read more →
										</Link>
									</div>
								</div>

								{/* Actions Menu */}
								{showActions && isOwnPosts && (
									<div className="flex items-center space-x-2 ml-4">
										<Link
											href={`/post/${post.slug}/edit`}
											className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
											title="Edit post"
										>
											<Edit className="w-4 h-4" />
										</Link>
										<button
											onClick={() => setShowDeleteModal(post.id)}
											className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
											title="Delete post"
										>
											<Trash2 className="w-4 h-4" />
										</button>
									</div>
								)}
							</div>
						</div>
					</article>
				))}
			</div>

			{/* Load More Button */}
			{hasMore && (
				<div className="text-center">
					<button
						onClick={loadMore}
						disabled={loadingMore}
						className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loadingMore ? (
							<>
								<div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full inline-block"></div>
								Loading...
							</>
						) : (
							'Load More Posts'
						)}
					</button>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{showDeleteModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
						<h3 className="text-lg font-medium text-gray-900 mb-4">
							Delete Post
						</h3>
						<p className="text-gray-600 mb-6">
							Are you sure you want to delete this post? This action cannot be undone.
						</p>
						<div className="flex justify-end space-x-3">
							<button
								onClick={() => setShowDeleteModal(null)}
								className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
							>
								Cancel
							</button>
							<button
								onClick={() => handleDelete(showDeleteModal)}
								className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
