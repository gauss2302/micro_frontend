// lib/api.ts - Updated with authenticated post fetching
import axios, { AxiosInstance, AxiosResponse } from 'axios'

export interface APIResponse<T = any> {
	success: boolean
	message: string
	data?: T
	error?: {
		code: string
		message: string
	}
}

export interface User {
	id: string
	email: string
	name: string
	picture?: string
	bio?: string
	location?: string
	website?: string
	is_active: boolean
	created_at: string
	updated_at: string
}

export interface AuthTokens {
	access_token: string
	refresh_token: string
	token_type: string
	expires_in: number
}

export interface AuthResponse {
	user: User
	tokens: AuthTokens
}

export interface GoogleAuthURLResponse {
	auth_url: string
	state: string
}

// Post interfaces
export interface Post {
	id: string
	user_id: string
	title: string
	content: string
	slug: string
	published: boolean
	created_at: string
	updated_at: string
}

export interface PostSummary {
	id: string
	user_id: string
	title: string
	slug: string
	published: boolean
	created_at: string
	updated_at: string
}

export interface CreatePostRequest {
	title: string
	content: string
	slug?: string
	published?: boolean
}

export interface UpdatePostRequest {
	title?: string
	content?: string
	slug?: string
	published?: boolean
}

export interface ListPostsResponse {
	posts: PostSummary[]
	limit: number
	offset: number
	total: number
}

export interface PostStatsResponse {
	total_published_posts: number
	user_posts_count?: number
}

class APIClient {
	private client: AxiosInstance
	private refreshPromise: Promise<AuthResponse> | null = null

	constructor() {
		this.client = axios.create({
			baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
			timeout: 10000,
			headers: {
				'Content-Type': 'application/json',
			},
		})

		// Request interceptor to add auth token
		this.client.interceptors.request.use(
			(config) => {
				const token = this.getStoredToken()
				if (token) {
					config.headers.Authorization = `Bearer ${token}`
				}
				return config
			},
			(error) => Promise.reject(error)
		)

		// Response interceptor for error handling
		this.client.interceptors.response.use(
			(response) => response,
			async (error) => {
				const originalRequest = error.config

				if (error.response?.status === 401 && !originalRequest._retry) {
					originalRequest._retry = true

					// Prevent multiple refresh attempts
					if (!this.refreshPromise) {
						const refreshToken = this.getStoredRefreshToken()
						if (refreshToken) {
							this.refreshPromise = this.refreshToken(refreshToken)
								.then((authResponse) => {
									// Store new tokens and user data
									this.storeTokens(authResponse.tokens)
									this.storeUser(authResponse.user)
									return authResponse
								})
								.catch((refreshError) => {
									// Refresh failed, clear tokens and redirect
									this.clearTokens()
									if (typeof window !== 'undefined') {
										window.location.href = '/login'
									}
									throw refreshError
								})
								.finally(() => {
									this.refreshPromise = null
								})
						}
					}

					if (this.refreshPromise) {
						try {
							await this.refreshPromise
							// Update the authorization header with new token
							const newToken = this.getStoredToken()
							if (newToken) {
								originalRequest.headers.Authorization = `Bearer ${newToken}`
							}
							// Retry the original request
							return this.client.request(originalRequest)
						} catch (refreshError) {
							return Promise.reject(refreshError)
						}
					}
				}

				return Promise.reject(error)
			}
		)
	}

	private getStoredToken(): string | null {
		if (typeof window !== 'undefined') {
			return localStorage.getItem('access_token')
		}
		return null
	}

	private getStoredRefreshToken(): string | null {
		if (typeof window !== 'undefined') {
			return localStorage.getItem('refresh_token')
		}
		return null
	}

	private clearTokens(): void {
		if (typeof window !== 'undefined') {
			localStorage.removeItem('access_token')
			localStorage.removeItem('refresh_token')
			localStorage.removeItem('user')
		}
	}

	// ===== AUTH ENDPOINTS =====
	async getGoogleAuthURL(): Promise<GoogleAuthURLResponse> {
		const response: AxiosResponse<APIResponse<GoogleAuthURLResponse>> = await this.client.get(
			'/api/v1/auth/google'
		)

		if (!response.data.success) {
			throw new Error(response.data.error?.message || 'Failed to get Google auth URL')
		}

		return response.data.data!
	}

	async exchangeAuthCode(authCode: string): Promise<AuthResponse> {
		const response: AxiosResponse<APIResponse<AuthResponse>> = await this.client.post(
			'/api/v1/auth/exchange',
			{ auth_code: authCode }
		)

		if (!response.data.success) {
			throw new Error(response.data.error?.message || 'Failed to exchange auth code')
		}

		const authResponse = response.data.data!
		console.log('Auth exchange successful, user:', authResponse.user.name)
		return authResponse
	}

	async refreshToken(refreshToken: string): Promise<AuthResponse> {
		// Don't use interceptors for refresh token request to avoid infinite loops
		const response: AxiosResponse<APIResponse<AuthResponse>> = await axios.post(
			`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/auth/refresh`,
			{ refresh_token: refreshToken },
			{
				headers: { 'Content-Type': 'application/json' },
				timeout: 10000,
			}
		)

		if (!response.data.success) {
			throw new Error(response.data.error?.message || 'Failed to refresh token')
		}

		const authResponse = response.data.data!
		console.log('Token refresh successful, user:', authResponse.user.name)
		return authResponse
	}

	async logout(): Promise<void> {
		const token = this.getStoredToken()
		if (token) {
			try {
				await this.client.post('/api/v1/auth/logout', { access_token: token })
			} catch (error) {
				// Ignore logout errors
				console.warn('Logout request failed:', error)
			}
		}
		this.clearTokens()
	}

	async validateToken(): Promise<{ valid: boolean; user_id?: string; email?: string }> {
		const response: AxiosResponse<APIResponse<{ valid: boolean; user_id?: string; email?: string }>> =
			await this.client.get('/api/v1/auth/validate')

		if (!response.data.success) {
			throw new Error(response.data.error?.message || 'Failed to validate token')
		}

		return response.data.data!
	}

	// ===== USER ENDPOINTS =====
	async getCurrentUser(): Promise<User> {
		const token = this.getStoredToken()
		if (!token) {
			throw new Error('No access token available')
		}

		// First validate the token to get user ID
		const validation = await this.validateToken()
		if (!validation.valid || !validation.user_id) {
			throw new Error('Invalid token')
		}

		// Get user details
		const response: AxiosResponse<APIResponse<User>> = await this.client.get(
			`/api/v1/users/${validation.user_id}`
		)

		if (!response.data.success) {
			throw new Error(response.data.error?.message || 'Failed to get user data')
		}

		const user = response.data.data!
		console.log('Current user fetched:', user.name)
		return user
	}

	async getUserProfile(userId: string): Promise<User> {
		const response: AxiosResponse<APIResponse<User>> = await this.client.get(
			`/api/v1/public/users/${userId}/profile`
		)

		if (!response.data.success) {
			throw new Error(response.data.error?.message || 'Failed to get user profile')
		}

		return response.data.data!
	}

	// ===== POST ENDPOINTS =====

	// Create a new post
	async createPost(postData: CreatePostRequest): Promise<Post> {
		const response: AxiosResponse<APIResponse<Post>> = await this.client.post(
			'/api/v1/posts',
			postData
		)

		if (!response.data.success) {
			throw new Error(response.data.error?.message || 'Failed to create post')
		}

		return response.data.data!
	}

	// Get a specific post by ID (authenticated - can access own drafts)
	async getPost(postId: string): Promise<Post> {
		const response: AxiosResponse<APIResponse<Post>> = await this.client.get(
			`/api/v1/posts/${postId}`
		)

		if (!response.data.success) {
			throw new Error(response.data.error?.message || 'Failed to get post')
		}

		return response.data.data!
	}

	// Get a post by slug (public - only published posts)
	async getPostBySlug(slug: string): Promise<Post> {
		const response: AxiosResponse<APIResponse<Post>> = await this.client.get(
			`/api/v1/public/posts/slug/${slug}`
		)

		if (!response.data.success) {
			throw new Error(response.data.error?.message || 'Failed to get post')
		}

		return response.data.data!
	}

	// Get a post by slug (authenticated - can access own drafts)
	async getOwnPostBySlug(slug: string): Promise<Post> {
		const response: AxiosResponse<APIResponse<Post>> = await this.client.get(
			`/api/v1/posts/slug/${slug}`
		)

		if (!response.data.success) {
			throw new Error(response.data.error?.message || 'Failed to get post for editing')
		}

		return response.data.data!
	}

	// Update a post
	async updatePost(postId: string, postData: UpdatePostRequest): Promise<Post> {
		const response: AxiosResponse<APIResponse<Post>> = await this.client.put(
			`/api/v1/posts/${postId}`,
			postData
		)

		if (!response.data.success) {
			throw new Error(response.data.error?.message || 'Failed to update post')
		}

		return response.data.data!
	}

	// Delete a post
	async deletePost(postId: string): Promise<void> {
		const response: AxiosResponse<APIResponse<void>> = await this.client.delete(
			`/api/v1/posts/${postId}`
		)

		if (!response.data.success) {
			throw new Error(response.data.error?.message || 'Failed to delete post')
		}
	}

	// List posts (public)
	async listPosts(params: {
		limit?: number
		offset?: number
		published_only?: boolean
	} = {}): Promise<ListPostsResponse> {
		const searchParams = new URLSearchParams()
		if (params.limit) searchParams.append('limit', params.limit.toString())
		if (params.offset) searchParams.append('offset', params.offset.toString())
		if (params.published_only !== undefined) {
			searchParams.append('published_only', params.published_only.toString())
		}

		const response: AxiosResponse<APIResponse<ListPostsResponse>> = await this.client.get(
			`/api/v1/public/posts?${searchParams.toString()}`
		)

		if (!response.data.success) {
			throw new Error(response.data.error?.message || 'Failed to list posts')
		}

		return response.data.data!
	}

	// Get user's posts
	async getUserPosts(userId: string, params: {
		limit?: number
		offset?: number
	} = {}): Promise<ListPostsResponse> {
		const searchParams = new URLSearchParams()
		if (params.limit) searchParams.append('limit', params.limit.toString())
		if (params.offset) searchParams.append('offset', params.offset.toString())

		const response: AxiosResponse<APIResponse<ListPostsResponse>> = await this.client.get(
			`/api/v1/public/posts/user/${userId}?${searchParams.toString()}`
		)

		if (!response.data.success) {
			throw new Error(response.data.error?.message || 'Failed to get user posts')
		}

		return response.data.data!
	}

	// Search posts
	async searchPosts(params: {
		q: string
		limit?: number
		offset?: number
		published_only?: boolean
	}): Promise<ListPostsResponse> {
		const searchParams = new URLSearchParams()
		searchParams.append('q', params.q)
		if (params.limit) searchParams.append('limit', params.limit.toString())
		if (params.offset) searchParams.append('offset', params.offset.toString())
		if (params.published_only !== undefined) {
			searchParams.append('published_only', params.published_only.toString())
		}

		const response: AxiosResponse<APIResponse<ListPostsResponse>> = await this.client.get(
			`/api/v1/public/posts/search?${searchParams.toString()}`
		)

		if (!response.data.success) {
			throw new Error(response.data.error?.message || 'Failed to search posts')
		}

		return response.data.data!
	}

	// Get post statistics
	async getPostStats(): Promise<PostStatsResponse> {
		const response: AxiosResponse<APIResponse<PostStatsResponse>> = await this.client.get(
			'/api/v1/public/posts/stats'
		)

		if (!response.data.success) {
			throw new Error(response.data.error?.message || 'Failed to get post stats')
		}

		return response.data.data!
	}

	// ===== TOKEN MANAGEMENT HELPERS =====
	storeTokens(tokens: AuthTokens): void {
		if (typeof window !== 'undefined') {
			localStorage.setItem('access_token', tokens.access_token)
			localStorage.setItem('refresh_token', tokens.refresh_token)
			console.log('Tokens stored successfully')
		}
	}

	storeUser(user: User): void {
		if (typeof window !== 'undefined') {
			localStorage.setItem('user', JSON.stringify(user))
			console.log('User data stored:', user.name)
		}
	}

	getStoredUser(): User | null {
		if (typeof window !== 'undefined') {
			try {
				const userStr = localStorage.getItem('user')
				if (userStr) {
					const user = JSON.parse(userStr)
					console.log('Retrieved stored user:', user.name)
					return user
				}
			} catch (error) {
				console.error('Failed to parse stored user data:', error)
				// Clear corrupted user data
				localStorage.removeItem('user')
			}
		}
		return null
	}
}

export const apiClient = new APIClient()
