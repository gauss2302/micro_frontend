"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedRoute } from "@/components/Protected"
import PostEditor from '@/components/post/PostEditor'
import { usePostStore } from '@/store/postStore'
import { useAuthStore } from '@/store/authStore'
import { Post } from '@/lib/api'
import { ArrowLeft, AlertCircle } from 'lucide-react'

export default function EditPostPage() {
	const params = useParams()
	const router = useRouter()
	const { user } = useAuthStore()
	const { currentPost, isLoading, error, fetchPostBySlugForEdit, clearCurrentPost, clearError } = usePostStore()
	const [initializationError, setInitializationError] = useState<string | null>(null)

	const slug = params.slug as string

	useEffect(() => {
		console.log('EditPostPage mounted with slug:', slug)
		clearError()
		setInitializationError(null)

		if (!slug) {
			setInitializationError('Invalid post URL')
			return
		}

		// Use the authenticated endpoint to fetch the post for editing
		fetchPostBySlugForEdit(slug).catch((err) => {
			console.error('Failed to fetch post for editing:', err)
			setInitializationError('Failed to load post for editing. You may not have permission to edit this post.')
		})

		return () => {
			clearCurrentPost()
		}
	}, [slug, fetchPostBySlugForEdit, clearCurrentPost, clearError])

	// Check if user can edit this post
	useEffect(() => {
		if (currentPost && user) {
			console.log('Checking edit permissions:', {
				postUserId: currentPost.user_id,
				currentUserId: user.id,
				canEdit: currentPost.user_id === user.id
			})

			if (currentPost.user_id !== user.id) {
				setInitializationError('You do not have permission to edit this post')
			}
		}
	}, [currentPost, user])

	const handleSaveSuccess = (savedPost: Post) => {
		console.log('Post saved successfully:', savedPost.title)
		// Navigate to the post view page
		router.push(`/post/${savedPost.slug}`)
	}

	const handleCancel = () => {
		if (currentPost) {
			router.push(`/post/${currentPost.slug}`)
		} else {
			router.push('/dashboard')
		}
	}

	if (isLoading) {
		return (
			<ProtectedRoute>
				<div className="min-h-screen bg-gray-50">
					<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
						<div className="text-center">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
							<p className="text-gray-600">Loading post for editing...</p>
						</div>
					</div>
				</div>
			</ProtectedRoute>
		)
	}

	if (error || initializationError) {
		return (
			<ProtectedRoute>
				<div className="min-h-screen bg-gray-50">
					<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
						<div className="max-w-md mx-auto text-center">
							<AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
							<h1 className="text-2xl font-bold text-gray-900 mb-4">
								Cannot Edit Post
							</h1>
							<p className="text-gray-600 mb-6">
								{initializationError || error || 'The post could not be loaded for editing.'}
							</p>
							<div className="space-y-3">
								<button
									onClick={() => router.back()}
									className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
								>
									<ArrowLeft className="w-4 h-4 mr-2" />
									Go Back
								</button>
								<div>
									<button
										onClick={() => router.push('/dashboard')}
										className="text-indigo-600 hover:text-indigo-700 text-sm"
									>
										Go to Dashboard →
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</ProtectedRoute>
		)
	}

	if (!currentPost) {
		return (
			<ProtectedRoute>
				<div className="min-h-screen bg-gray-50">
					<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
						<div className="max-w-md mx-auto text-center">
							<h1 className="text-2xl font-bold text-gray-900 mb-4">
								Post Not Found
							</h1>
							<p className="text-gray-600 mb-6">
								The post you're trying to edit doesn't exist or has been removed.
							</p>
							<button
								onClick={() => router.push('/dashboard')}
								className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
							>
								<ArrowLeft className="w-4 h-4 mr-2" />
								Back to Dashboard
							</button>
						</div>
					</div>
				</div>
			</ProtectedRoute>
		)
	}

	// Check permission one more time before rendering editor
	if (currentPost.user_id !== user?.id) {
		return (
			<ProtectedRoute>
				<div className="min-h-screen bg-gray-50">
					<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
						<div className="max-w-md mx-auto text-center">
							<AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
							<h1 className="text-2xl font-bold text-gray-900 mb-4">
								Access Denied
							</h1>
							<p className="text-gray-600 mb-6">
								You don't have permission to edit this post.
							</p>
							<button
								onClick={() => router.push(`/post/${currentPost.slug}`)}
								className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
							>
								<ArrowLeft className="w-4 h-4 mr-2" />
								View Post
							</button>
						</div>
					</div>
				</div>
			</ProtectedRoute>
		)
	}

	console.log('Rendering PostEditor with post:', currentPost.title)

	return (
		<ProtectedRoute>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Debug info (remove in production) */}
					<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 text-sm mb-4 rounded">
						<strong>Debug:</strong> Editing post "{currentPost.title}" (Published: {currentPost.published ? 'Yes' : 'No'})
					</div>

					<PostEditor
						existingPost={currentPost}
						onSave={handleSaveSuccess}
						onCancel={handleCancel}
					/>
				</div>
			</div>
		</ProtectedRoute>
	)
}
