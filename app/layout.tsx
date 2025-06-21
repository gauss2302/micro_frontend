import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import './globals.css'
import {AuthProvider} from "@/components/AuthProvider";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'BlogHub - Share Your Stories With the World',
	description: 'A modern platform for writers and readers.',
}

export default function RootLayout({
									   children,
								   }: {
	children: React.ReactNode
}) {
	return (
		<html lang="en" className="h-full">
		<body className={`${inter.className} h-full antialiased`}>
		<AuthProvider>
			<div className="min-h-screen bg-gray-50 flex flex-col">
				<Header />
				<main className="flex-1">
					{children}
				</main>
				<Footer />
			</div>
		</AuthProvider>
		</body>
		</html>
	)
}
