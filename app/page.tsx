'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import {useAuthStore} from "@/store/authStore";

export default function HomePage() {
	let { isAuthenticated } = useAuthStore()

	return (
		<>
			{/* Hero Section */}
			<section className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
					<div className="text-center">
						<h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
							Share Your Stories
							<span className="block text-indigo-600">With the World</span>
						</h1>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
							Join thousands of writers and readers on BlogHub.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							{isAuthenticated ? (
								<Link href="/write" className="btn-primary">
									Start Writing <ArrowRight className="ml-2 w-5 h-5" />
								</Link>
							) : (
								<Link href="/login" className="btn-primary">
									Get Started <ArrowRight className="ml-2 w-5 h-5" />
								</Link>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Featured Posts Section */}
			<section className="py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Stories</h2>
					</div>
					{/* Posts content */}
				</div>
			</section>
		</>
	)
}
