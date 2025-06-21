"use client";

import Link from 'next/link'
import { PenTool } from 'lucide-react'

export function Footer() {
	return (
		<footer className="bg-white border-t border-gray-200 mt-16">
			<div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					<div className="col-span-1 md:col-span-2">
						<div className="flex items-center space-x-2 mb-4">
							<div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
								<PenTool className="w-5 h-5 text-white" />
							</div>
							<span className="text-xl font-bold text-gray-900">BlogHub</span>
						</div>
						<p className="text-gray-600 max-w-md">
							A modern platform for writers and readers to share stories, insights, and ideas.
						</p>
					</div>

					<div>
						<h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
							Platform
						</h3>
						<ul className="space-y-2">
							<li><Link href="/explore" className="text-gray-600 hover:text-gray-900">Explore</Link></li>
							<li><Link href="/trending" className="text-gray-600 hover:text-gray-900">Trending</Link></li>
						</ul>
					</div>

					<div>
						<h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
							Company
						</h3>
						<ul className="space-y-2">
							<li><Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link></li>
							<li><Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link></li>
						</ul>
					</div>
				</div>

				<div className="mt-8 pt-8 border-t border-gray-200">
					<p className="text-center text-gray-400 text-sm">
						© 2024 BlogHub. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	)
}
