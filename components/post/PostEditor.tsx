'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import {useAuthStore} from "@/store/authStore";

interface PostEditorProps {
	existingPost?: {
		id: string
		title: string
		content: string
		slug?: string
		published: boolean
	}
}

export default function PostEditor({ existingPost }: PostEditorProps) {
	const [title, setTitle] = useState(existingPost?.title || '')
	const [content, setContent] = useState(existingPost?.content || '')
	const [slug, setSlug] = useState(existingPost?.slug || '')
	const [published, setPublished] = useState(existingPost?.published || false)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')

	const { user } = useAuthStore()
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!user) return

		setIsLoading(true)
		setError('')

		try {
			const postData = { title, content, slug, published }

			if (existingPost) {
				// Update existing post
				// await apiClient.updatePost(existingPost.id, postData)
			} else {
				// Create new post
				// await apiClient.createPost(postData)
			}

			router.push('/dashboard')
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to save post')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{error && (
				<div className="alert-error">
					{error}
				</div>
			)}

			<div className="form-group">
				<label htmlFor="title" className="form-label">Title</label>
				<input
					type="text"
					id="title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					className="input-primary"
					placeholder="Enter post title..."
					required
				/>
			</div>

			<div className="form-group">
				<label htmlFor="slug" className="form-label">Slug (optional)</label>
				<input
					type="text"
					id="slug"
					value={slug}
					onChange={(e) => setSlug(e.target.value)}
					className="input-primary"
					placeholder="custom-url-slug"
				/>
				<p className="form-help">Leave empty to auto-generate from title</p>
			</div>

			<div className="form-group">
				<label htmlFor="content" className="form-label">Content</label>
				<textarea
					id="content"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					className="input-primary min-h-96"
					placeholder="Write your post content..."
					required
				/>
			</div>

			<div className="flex items-center space-x-4">
				<label className="flex items-center">
					<input
						type="checkbox"
						checked={published}
						onChange={(e) => setPublished(e.target.checked)}
						className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
					/>
					<span className="ml-2 text-sm text-gray-700">Publish immediately</span>
				</label>
			</div>

			<div className="flex justify-end space-x-4">
				<button
					type="button"
					onClick={() => router.back()}
					className="btn-secondary"
					disabled={isLoading}
				>
					Cancel
				</button>
				<button
					type="submit"
					className="btn-primary"
					disabled={isLoading}
				>
					{isLoading ? 'Saving...' : existingPost ? 'Update Post' : 'Create Post'}
				</button>
			</div>
		</form>
	)
}
