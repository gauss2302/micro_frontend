'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, EyeOff, X, AlertCircle, ArrowLeft } from 'lucide-react'
import { usePostStore } from '@/store/postStore'
import { useAuthStore } from '@/store/authStore'
import { Post } from '@/lib/api'

interface PostEditorProps {
	existingPost?: Post
	onSave?: (post: Post) => void
	onCancel?: () => void
}

export default function PostEditor({ existingPost, onSave, onCancel }: PostEditorProps) {
	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')
	const [slug, setSlug] = useState('')
	const [published, setPublished] = useState(false)
	const [isDirty, setIsDirty] = useState(false)
	const [hasInitialized, setHasInitialized] = useState(false)

	const { createPost, updatePost, isLoading, error, clearError } = usePostStore()
	const { user } = useAuthStore()
	const router = useRouter()

	const isEditMode = !!existingPost

	// Initialize form with existing post data
	useEffect(() => {
		if (existingPost && !hasInitialized) {
			setTitle(existingPost.title || '')
			setContent(existingPost.content || '')
			setSlug(existingPost.slug || '')
			setPublished(existingPost.published || false)
			setHasInitialized(true)
		} else if (!existingPost && !hasInitialized) {
			// Initialize empty form for new post
			setTitle('')
			setContent('')
			setSlug('')
			setPublished(false)
			setHasInitialized(true)
		}
	}, [existingPost, hasInitialized])

	// Generate slug from title
	const generateSlug = (title: string) => {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim()
			.substring(0, 100)
	}

	// Auto-generate slug when title changes (only for new posts)
	useEffect(() => {
		if (title && !isEditMode && hasInitialized) {
			const newSlug = generateSlug(title)
			setSlug(newSlug)
		}
	}, [title, isEditMode, hasInitialized])

	// Track if form is dirty
	useEffect(() => {
		if (!hasInitialized) return

		if (existingPost) {
			const hasChanges =
				title !== (existingPost.title || '') ||
				content !== (existingPost.content || '') ||
				slug !== (existingPost.slug || '') ||
				published !== (existingPost.published || false)
			setIsDirty(hasChanges)
		} else {
			setIsDirty(title.trim() !== '' || content.trim() !== '')
		}
	}, [title, content, slug, published, existingPost, hasInitialized])

	// Clear error when component mounts
	useEffect(() => {
		clearError()
	}, [clearError])

	const handleSubmit = async (e: React.FormEvent, shouldPublish?: boolean) => {
		e.preventDefault()
		if (!user) {
			console.error('User not authenticated')
			return
		}

		const trimmedTitle = title.trim()
		const trimmedContent = content.trim()
		const trimmedSlug = slug.trim()

		if (!trimmedTitle || !trimmedContent) {
			return
		}

		const postData = {
			title: trimmedTitle,
			content: trimmedContent,
			slug: trimmedSlug || generateSlug(trimmedTitle),
			published: shouldPublish ?? published
		}

		try {
			let savedPost: Post

			if (existingPost) {
				savedPost = await updatePost(existingPost.id, postData)
			} else {
				savedPost = await createPost(postData)
			}

			setIsDirty(false)

			if (onSave) {
				onSave(savedPost)
			} else {
				// Navigate to the post or dashboard
				if (savedPost.published) {
					router.push(`/post/${savedPost.slug}`)
				} else {
					router.push('/dashboard')
				}
			}
		} catch (error) {
			// Error is handled by the store
			console.error('Failed to save post:', error)
		}
	}

	const handleCancel = () => {
		if (onCancel) {
			onCancel()
		} else if (existingPost) {
			router.push(`/post/${existingPost.slug}`)
		} else {
			router.push('/dashboard')
		}
	}

	const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newSlug = e.target.value
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
		setSlug(newSlug)
	}

	// Don't render until initialized
	if (!hasInitialized) {
		return (
			<div className="max-w-4xl mx-auto">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
					<div className="space-y-6">
						<div className="h-12 bg-gray-200 rounded"></div>
						<div className="h-8 bg-gray-200 rounded"></div>
						<div className="h-64 bg-gray-200 rounded"></div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="max-w-4xl mx-auto">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						{isEditMode ? 'Edit Post' : 'Write a New Post'}
					</h1>
					{isEditMode && (
						<p className="text-sm text-gray-600 mt-1">
							Last updated: {existingPost ? new Date(existingPost.updated_at).toLocaleDateString() : 'Unknown'}
						</p>
					)}
				</div>
				<button
					onClick={handleCancel}
					className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
					title="Cancel editing"
				>
					<X className="w-5 h-5" />
				</button>
			</div>

			{/* Error Alert */}
			{error && (
				<div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
					<AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
					<div className="flex-1">
						<h3 className="text-sm font-medium text-red-800">Error</h3>
						<p className="text-sm text-red-700 mt-1">{error}</p>
					</div>
					<button
						onClick={clearError}
						className="text-red-400 hover:text-red-600"
					>
						<X className="w-4 h-4" />
					</button>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Title */}
				<div>
					<label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
						Title *
					</label>
					<input
						type="text"
						id="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
						placeholder="Enter your post title..."
						required
					/>
				</div>

				{/* Slug */}
				<div>
					<label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
						URL Slug
					</label>
					<div className="flex items-center space-x-2">
						<span className="text-sm text-gray-500 whitespace-nowrap">
							{process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://your-blog.com'}/post/
						</span>
						<input
							type="text"
							id="slug"
							value={slug}
							onChange={handleSlugChange}
							className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							placeholder="custom-url-slug"
						/>
					</div>
					<p className="text-xs text-gray-500 mt-1">
						This will be the URL for your post. Leave empty to auto-generate from title.
					</p>
				</div>

				{/* Content */}
				<div>
					<label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
						Content *
					</label>
					<textarea
						id="content"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-96 resize-y"
						placeholder="Tell your story..."
						required
					/>
					<div className="flex justify-between text-xs text-gray-500 mt-1">
						<span>{content.length} characters</span>
						<span>Markdown supported</span>
					</div>
				</div>

				{/* Publishing Options */}
				<div className="bg-gray-50 rounded-lg p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<button
								type="button"
								onClick={() => setPublished(!published)}
								className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
									published ? 'bg-indigo-600' : 'bg-gray-200'
								}`}
							>
								<span
									className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
										published ? 'translate-x-6' : 'translate-x-1'
									}`}
								/>
							</button>
							<div>
								<p className="text-sm font-medium text-gray-900">
									{published ? 'Published' : 'Draft'}
								</p>
								<p className="text-xs text-gray-500">
									{published
										? 'Your post will be visible to everyone'
										: 'Only you can see this post'
									}
								</p>
							</div>
						</div>
						<div className="flex items-center text-sm text-gray-500">
							{published ? (
								<><Eye className="w-4 h-4 mr-1" /> Public</>
							) : (
								<><EyeOff className="w-4 h-4 mr-1" /> Private</>
							)}
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex items-center justify-between pt-6 border-t border-gray-200">
					<div className="flex items-center space-x-4">
						<button
							type="button"
							onClick={handleCancel}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
							disabled={isLoading}
						>
							Cancel
						</button>

						{!published && (
							<button
								type="submit"
								onClick={(e) => handleSubmit(e, false)}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
								disabled={isLoading || !title.trim() || !content.trim()}
							>
								{isLoading ? (
									<>
										<div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full inline-block"></div>
										Saving...
									</>
								) : (
									<>
										<Save className="w-4 h-4 mr-2 inline-block" />
										Save Draft
									</>
								)}
							</button>
						)}
					</div>

					<div className="flex items-center space-x-3">
						{isDirty && (
							<span className="text-xs text-amber-600 flex items-center">
								<div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
								Unsaved changes
							</span>
						)}

						<button
							type="submit"
							onClick={(e) => handleSubmit(e, true)}
							className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={isLoading || !title.trim() || !content.trim()}
						>
							{isLoading ? (
								<>
									<div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block"></div>
									{isEditMode ? 'Updating...' : 'Publishing...'}
								</>
							) : (
								<>
									<Eye className="w-4 h-4 mr-2 inline-block" />
									{isEditMode ? 'Update Post' : 'Publish Post'}
								</>
							)}
						</button>
					</div>
				</div>
			</form>

			{/* Tips */}
			<div className="mt-8 bg-blue-50 rounded-lg p-4">
				<h3 className="text-sm font-medium text-blue-900 mb-2">
					{isEditMode ? 'Editing Tips' : 'Writing Tips'}
				</h3>
				<ul className="text-sm text-blue-800 space-y-1">
					<li>• Use descriptive titles to help readers find your content</li>
					<li>• Break up long paragraphs for better readability</li>
					<li>• You can use Markdown formatting in your content</li>
					<li>• Save drafts frequently to avoid losing your work</li>
					{isEditMode && <li>• Changes are automatically tracked - you can always revert if needed</li>}
				</ul>
			</div>
		</div>
	)
}
