import Link from "next/link";

export default function Home() {
	return (
		<main className="flex flex-col items-center justify-center flex-1 gap-6">
			<h1 className="text-2xl md:text-4xl font-bold mb-6 text-center px-4">
				Welcome to Basketball Attendance
			</h1>
			<Link
				href="/attendance"
				className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
			>
				Go to Attendance Page
			</Link>
			<Link
				href="/admin"
				className="hidden md:block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
			>
				Admin Panel
			</Link>
		</main>
	);
}
