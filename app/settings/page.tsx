import {ProtectedRoute} from "@/components/Protected";

export default function SettingsPage() {
	return (
		<ProtectedRoute>
				<div className="max-w-4xl mx-auto px-4 py-8">
					<h1 className="text-3xl font-bold mb-8">Settings</h1>
					{/* Settings content */}
				</div>
		</ProtectedRoute>
	)
}
