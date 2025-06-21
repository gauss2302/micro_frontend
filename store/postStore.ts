import { create } from 'zustand'
import {
	apiClient,
	Post,
	PostSummary,
	CreatePostRequest,
	UpdatePostRequest,
	ListPostsResponse,
	PostStatsResponse
} from '@/lib/api'

interface PostState {
	// State
	posts: PostSummary[]
	currentPost: Post | null
	userPosts: PostSummary[]
	stats: PostStatsResponse | null
	isLoading: boolean
	error: string | null

	// Pagination
	hasMore: boolean
	currentPage: number

	// Actions
	createPost: (postData: CreatePostRequest) => Promise<Post>
	updatePost: (postId: string, postData: UpdatePostRequest) => Promise<Post>
	deletePost: (postId: string) => Promise<void>
	fetchPosts: (params?: { limit?: number; offset?: number; published_only?: boolean }) => Promise<void>
	fetchPost: (postId: string) => Promise<void>
	fetchPostBySlug: (slug: string) => Promise<void>
	fetchPostBySlugForEdit: (slug: string) => Promise<void>
	fetchUserPosts: (userId: string, params?: { limit?: number; offset?: number }) => Promise<void>
	searchPosts: (query: string, params?: { limit?: number; offset?: number; published_only?: boolean }) => Promise<void>
	fetchStats: () => Promise<void>
	clearCurrentPost: () => void
	clearError: () => void
	resetPosts: () => void
}

export const usePostStore = create<PostState>((set, get) => ({
	// Initial state
	posts: [],
	currentPost: null,
	userPosts: [],
	stats: null,
	isLoading: false,
	error: null,
	hasMore: true,
	currentPage: 0,

	// Actions
	createPost: async (postData: CreatePostRequest) => {
		set({ isLoading: true, error: null })

		try {
			const newPost = await apiClient.createPost(postData)

			// Add to user posts if we're viewing user posts
			const { userPosts } = get()
			if (userPosts.length > 0) {
				set({
					userPosts: [newPost, ...userPosts],
					isLoading: false
				})
			} else {
				set({ isLoading: false })
			}

			return newPost
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create post'
			set({ error: errorMessage, isLoading: false })
			throw error
		}
	},

	updatePost: async (postId: string, postData: UpdatePostRequest) => {
		set({ isLoading: true, error: null })

		try {
			const updatedPost = await apiClient.updatePost(postId, postData)

			// Update in posts list
			const { posts, userPosts, currentPost } = get()

			set({
				posts: posts.map(post =>
					post.id === postId
						? { ...post, ...updatedPost, updated_at: updatedPost.updated_at }
						: post
				),
				userPosts: userPosts.map(post =>
					post.id === postId
						? { ...post, ...updatedPost, updated_at: updatedPost.updated_at }
						: post
				),
				currentPost: currentPost?.id === postId ? updatedPost : currentPost,
				isLoading: false
			})

			return updatedPost
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update post'
			set({ error: errorMessage, isLoading: false })
			throw error
		}
	},

	deletePost: async (postId: string) => {
		set({ isLoading: true, error: null })

		try {
			await apiClient.deletePost(postId)

			// Remove from all lists
			const { posts, userPosts, currentPost } = get()

			set({
				posts: posts.filter(post => post.id !== postId),
				userPosts: userPosts.filter(post => post.id !== postId),
				currentPost: currentPost?.id === postId ? null : currentPost,
				isLoading: false
			})
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete post'
			set({ error: errorMessage, isLoading: false })
			throw error
		}
	},

	fetchPosts: async (params = {}) => {
		set({ isLoading: true, error: null })

		try {
			const defaultParams = { limit: 20, offset: 0, published_only: true }
			const mergedParams = { ...defaultParams, ...params }

			const response = await apiClient.listPosts(mergedParams)

			// If offset is 0, replace posts, otherwise append
			const { posts: currentPosts } = get()
			const newPosts = mergedParams.offset === 0
				? response.posts
				: [...currentPosts, ...response.posts]

			set({
				posts: newPosts,
				hasMore: response.posts.length === mergedParams.limit,
				currentPage: Math.floor(mergedParams.offset / mergedParams.limit),
				isLoading: false
			})
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to fetch posts'
			set({ error: errorMessage, isLoading: false })
		}
	},

	fetchPost: async (postId: string) => {
		set({ isLoading: true, error: null })

		try {
			const post = await apiClient.getPost(postId)
			set({ currentPost: post, isLoading: false })
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to fetch post'
			set({ error: errorMessage, isLoading: false })
		}
	},

	fetchPostBySlug: async (slug: string) => {
		set({ isLoading: true, error: null })

		try {
			const post = await apiClient.getPostBySlug(slug)
			set({ currentPost: post, isLoading: false })
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to fetch post'
			set({ error: errorMessage, isLoading: false })
		}
	},

	// New method for fetching posts for editing (authenticated endpoint)
	fetchPostBySlugForEdit: async (slug: string) => {
		set({ isLoading: true, error: null })

		try {
			console.log('Fetching post for editing:', slug)
			const post = await apiClient.getOwnPostBySlug(slug)
			console.log('Post fetched for editing:', post.title, 'Published:', post.published)
			set({ currentPost: post, isLoading: false })
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to fetch post for editing'
			console.error('Error fetching post for editing:', errorMessage)
			set({ error: errorMessage, isLoading: false })
			throw error
		}
	},

	fetchUserPosts: async (userId: string, params = {}) => {
		set({ isLoading: true, error: null })

		try {
			const defaultParams = { limit: 20, offset: 0 }
			const mergedParams = { ...defaultParams, ...params }

			const response = await apiClient.getUserPosts(userId, mergedParams)

			// If offset is 0, replace posts, otherwise append
			const { userPosts: currentUserPosts } = get()
			const newUserPosts = mergedParams.offset === 0
				? response.posts
				: [...currentUserPosts, ...response.posts]

			set({
				userPosts: newUserPosts,
				hasMore: response.posts.length === mergedParams.limit,
				currentPage: Math.floor(mergedParams.offset / mergedParams.limit),
				isLoading: false
			})
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user posts'
			set({ error: errorMessage, isLoading: false })
		}
	},

	searchPosts: async (query: string, params = {}) => {
		set({ isLoading: true, error: null })

		try {
			const defaultParams = { limit: 20, offset: 0, published_only: true }
			const mergedParams = { ...defaultParams, ...params, q: query }

			const response = await apiClient.searchPosts(mergedParams)

			// If offset is 0, replace posts, otherwise append
			const { posts: currentPosts } = get()
			const newPosts = mergedParams.offset === 0
				? response.posts
				: [...currentPosts, ...response.posts]

			set({
				posts: newPosts,
				hasMore: response.posts.length === mergedParams.limit,
				currentPage: Math.floor(mergedParams.offset / mergedParams.limit),
				isLoading: false
			})
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to search posts'
			set({ error: errorMessage, isLoading: false })
		}
	},

	fetchStats: async () => {
		try {
			const stats = await apiClient.getPostStats()
			set({ stats })
		} catch (error) {
			console.warn('Failed to fetch post stats:', error)
		}
	},

	clearCurrentPost: () => {
		set({ currentPost: null })
	},

	clearError: () => {
		set({ error: null })
	},

	resetPosts: () => {
		set({
			posts: [],
			userPosts: [],
			currentPage: 0,
			hasMore: true
		})
	},
}))
