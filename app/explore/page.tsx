'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, TrendingUp, Clock, BookOpen } from 'lucide-react'
import PostList from '@/components/post/PostList'
import { usePostStore } from '@/store/postStore'

type SortOption = 'recent' | 'trending' | 'popular'

export default function ExplorePage() {
	const [searchQuery, setSearchQuery] = useState('')
	const [sortBy, setSortBy] = useState<SortOption>('recent')
	const [showFilters, setShowFilters] = useState(false)
	const { resetPosts } = usePostStore()

	// Reset posts when component mounts
	useEffect(() => {
		resetPosts()
	}, [resetPosts])

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		// The PostList component will handle the search when searchQuery changes
	}

	const handleClearSearch = () => {
		setSearchQuery('')
	}

	const sortOptions = [
		{ value: 'recent' as SortOption, label: 'Most Recent', icon: Clock },
		{ value: 'trending' as SortOption, label: 'Trending', icon: TrendingUp },
		{ value: 'popular' as SortOption, label: 'Popular', icon: BookOpen },
	]

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						Explore Stories
					</h1>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						Discover amazing content from writers around the world. Find your next great read.
					</p>
				</div>

				{/* Search and Filters */}
				<div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
					<form onSubmit={handleSearch} className="mb-4">
						<div className="flex gap-4">
							<div className="flex-1 relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search for stories, topics, or authors..."
									className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
								/>
								{searchQuery && (
									<button
										type="button"
										onClick={handleClearSearch}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
									>
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
										</svg>
									</button>
								)}
							</div>
							<button
								type="submit"
								className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
							>
								Search
							</button>
						</div>
					</form>

					{/* Sort Options */}
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<span className="text-sm font-medium text-gray-700">Sort by:</span>
							<div className="flex space-x-2">
								{sortOptions.map((option) => (
									<button
										key={option.value}
										onClick={() => setSortBy(option.value)}
										className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
											sortBy === option.value
												? 'bg-indigo-100 text-indigo-700'
												: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
										}`}
									>
										<option.icon className="w-4 h-4 mr-2" />
										{option.label}
									</button>
								))}
							</div>
						</div>

						<button
							onClick={() => setShowFilters(!showFilters)}
							className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
						>
							<Filter className="w-4 h-4 mr-2" />
							Filters
						</button>
					</div>

					{/* Advanced Filters (collapsed by default) */}
					{showFilters && (
						<div className="mt-4 pt-4 border-t border-gray-200">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Category
									</label>
									<select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
										<option value="">All Categories</option>
										<option value="technology">Technology</option>
										<option value="lifestyle">Lifestyle</option>
										<option value="business">Business</option>
										<option value="science">Science</option>
										<option value="arts">Arts & Culture</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Reading Time
									</label>
									<select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
										<option value="">Any Length</option>
										<option value="short">Under 5 min</option>
										<option value="medium">5-15 min</option>
										<option value="long">15+ min</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Published
									</label>
									<select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
										<option value="">All Time</option>
										<option value="today">Today</option>
										<option value="week">This Week</option>
										<option value="month">This Month</option>
									</select>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Search Results Info */}
				{searchQuery && (
					<div className="mb-6">
						<p className="text-gray-600">
							Search results for <span className="font-semibold text-gray-900">"{searchQuery}"</span>
						</p>
					</div>
				)}

				{/* Posts List */}
				<div className="bg-white rounded-lg border border-gray-200">
					<div className="p-6">
						<PostList
							published_only={true}
							showActions={false}
							searchQuery={searchQuery || undefined}
						/>
					</div>
				</div>

				{/* Popular Topics */}
				<div className="mt-12">
					<h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Topics</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
						{[
							'Technology', 'Design', 'Productivity', 'Startup', 'Marketing', 'Health',
							'Travel', 'Food', 'Photography', 'Writing', 'Leadership', 'Innovation'
						].map((topic) => (
							<button
								key={topic}
								onClick={() => setSearchQuery(topic)}
								className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
							>
								{topic}
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
