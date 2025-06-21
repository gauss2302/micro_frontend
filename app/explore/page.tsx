"use client";

import {useAuthStore} from "@/store/authStore";

export default function ExplorePage() {
	const { isAuthenticated } = useAuthStore()

	return (
			<div className="max-w-7xl mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-8">Explore Posts</h1>

				{/* Public content always visible */}
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
					<div className="lg:col-span-3">
						{/* Post list */}
					</div>

					<div className="lg:col-span-1">
						{/* Enhanced sidebar for authenticated users */}
						{isAuthenticated ? (
							<div className="space-y-6">
								<div className="card p-4">
									<h3 className="font-semibold mb-2">Personalized Recommendations</h3>
									{/* Personalized content */}
								</div>
								<div className="card p-4">
									<h3 className="font-semibold mb-2">Your Reading List</h3>
									{/* Reading list */}
								</div>
							</div>
						) : (
							<div className="card p-4">
								<h3 className="font-semibold mb-2">Join BlogHub</h3>
								<p className="text-gray-600 mb-4">
									Sign up to get personalized recommendations and save posts to read later.
								</p>
								<a href="/login" className="btn-primary w-full text-center">
									Sign Up
								</a>
							</div>
						)}
					</div>
				</div>
			</div>
	)
}
