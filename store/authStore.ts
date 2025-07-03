import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient, User, AuthTokens } from '@/lib/api'

interface AuthState {
	// State
	user: User | null
	isAuthenticated: boolean
	isLoading: boolean
	error: string | null
	isInitialized: boolean  // New flag to track initialization

	// Actions
	login: () => Promise<void>
	handleCallback: (authCode: string) => Promise<void>
	logout: () => Promise<void>
	refreshAuth: () => Promise<void>
	clearError: () => void
	checkAuth: () => Promise<void>
	updateUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			// Initial state
			user: null,
			isAuthenticated: false,
			isLoading: false,
			error: null,
			isInitialized: false,

			// Actions
			login: async () => {
				set({ isLoading: true, error: null })

				try {
					const { auth_url } = await apiClient.getGoogleAuthURL()

					// Redirect to Google OAuth
					window.location.href = auth_url
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : 'Login failed'
					set({ error: errorMessage, isLoading: false })
					throw error
				}
			},

			handleCallback: async (authCode: string) => {
				set({ isLoading: true, error: null })

				try {
					const authResponse = await apiClient.exchangeAuthCode(authCode)

					// Store tokens and user data
					apiClient.storeTokens(authResponse.tokens)
					apiClient.storeUser(authResponse.user)

					set({
						user: authResponse.user,
						isAuthenticated: true,
						isLoading: false,
						error: null,
						isInitialized: true
					})
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
					set({ error: errorMessage, isLoading: false })
					throw error
				}
			},

			logout: async () => {
				set({ isLoading: true })

				try {
					await apiClient.logout()
				} catch (error) {
					console.warn('Logout API call failed:', error)
				} finally {
					set({
						user: null,
						isAuthenticated: false,
						isLoading: false,
						error: null,
						isInitialized: true
					})
				}
			},

			refreshAuth: async () => {
				const refreshToken = typeof window !== 'undefined'
					? localStorage.getItem('refresh_token')
					: null

				if (!refreshToken) {
					set({ user: null, isAuthenticated: false, isInitialized: true })
					return
				}

				try {
					const authResponse = await apiClient.refreshToken(refreshToken)

					// Store new tokens and user data
					apiClient.storeTokens(authResponse.tokens)
					apiClient.storeUser(authResponse.user)

					// Update the store state with the refreshed user data
					set({
						user: authResponse.user,
						isAuthenticated: true,
						error: null,
						isInitialized: true
					})

					console.log('Token refreshed successfully, user:', authResponse.user.name)
				} catch (error) {
					console.warn('Token refresh failed:', error)

					// Clear all auth data on refresh failure
					set({ user: null, isAuthenticated: false, isInitialized: true })

					// Clear stored tokens
					if (typeof window !== 'undefined') {
						localStorage.removeItem('access_token')
						localStorage.removeItem('refresh_token')
						localStorage.removeItem('user')
					}
				}
			},

			checkAuth: async () => {
				// Don't check auth during hydration or if already initialized
				if (typeof window === 'undefined') {
					return
				}

				const { isInitialized } = get()
				if (isInitialized) {
					console.log('Auth already initialized, skipping check')
					return
				}

				const storedUser = apiClient.getStoredUser()
				const accessToken = localStorage.getItem('access_token')

				if (!storedUser || !accessToken) {
					set({ user: null, isAuthenticated: false, isInitialized: true })
					return
				}

				// Set the stored user data immediately to avoid UI flash
				set({
					user: storedUser,
					isAuthenticated: true,
					error: null
				})

				try {
					// Validate the current token
					const validation = await apiClient.validateToken()

					if (validation.valid) {
						// Token is valid, ensure we have the latest user data
						try {
							const currentUser = await apiClient.getCurrentUser()
							// Update with fresh user data
							apiClient.storeUser(currentUser)
							set({
								user: currentUser,
								isAuthenticated: true,
								error: null,
								isInitialized: true
							})
						} catch (userError) {
							console.warn('Failed to fetch current user, using stored data:', userError)
							// Keep using stored user data if fetching fresh data fails
							set({ isInitialized: true })
						}
					} else {
						// Token is invalid, try to refresh
						await get().refreshAuth()
					}
				} catch (error) {
					console.warn('Auth check failed, attempting refresh:', error)
					// Try to refresh auth
					try {
						await get().refreshAuth()
					} catch (refreshError) {
						console.warn('Refresh auth failed:', refreshError)
						set({ user: null, isAuthenticated: false, isInitialized: true })
					}
				}
			},

			updateUser: (user: User) => {
				// Helper function to update user data
				apiClient.storeUser(user)
				set({ user })
			},

			clearError: () => {
				set({ error: null })
			},
		}),
		{
			name: 'auth-storage',
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
				// Don't persist isInitialized to ensure fresh check on app restart
			}),
			// Skip hydration on server side
			skipHydration: true,
		}
	)
)
