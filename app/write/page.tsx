import { ProtectedRoute } from "@/components/Protected"
import PostEditor from "@/components/post/PostEditor"

export default function WritePage() {
	return (
		<ProtectedRoute>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<PostEditor />
				</div>
			</div>
		</ProtectedRoute>
	)
}
