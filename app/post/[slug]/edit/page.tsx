"use client";

import PostEditor from '@/components/post/PostEditor'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {ProtectedRoute} from "@/components/Protected";

export default function EditPostPage() {
	const params = useParams()
	const [post, setPost] = useState(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		// Fetch post data
		const fetchPost = async () => {
			try {
				// This will be handled by your API client
				const response = await fetch(`/api/posts/${params.slug}`)
				const data = await response.json()
				setPost(data)
			} catch (error) {
				console.error('Failed to fetch post:', error)
			} finally {
				setIsLoading(false)
			}
		}

		if (params.slug) {
			fetchPost()
		}
	}, [params.slug])

	return (
		<ProtectedRoute>
				<div className="max-w-4xl mx-auto px-4 py-8">
					<h1 className="text-3xl font-bold mb-8">Edit Post</h1>
					{isLoading ? (
						<div className="flex justify-center py-12">
							<div className="spinner w-8 h-8"></div>
						</div>
					) : post ? (
						<PostEditor existingPost={post} />
					) : (
						<div className="text-center py-12">
							<p className="text-gray-600">Post not found</p>
						</div>
					)}
				</div>
		</ProtectedRoute>
	)
}
