import {ProtectedRoute} from "@/components/Protected";
import PostEditor from "@/components/post/PostEditor";


export default function WritePage() {
	return (
		<ProtectedRoute>
				<div className="max-w-4xl mx-auto px-4 py-8">
					<h1 className="text-3xl font-bold mb-8">Write a New Post</h1>
					<PostEditor />
				</div>
		</ProtectedRoute>
	)
}
