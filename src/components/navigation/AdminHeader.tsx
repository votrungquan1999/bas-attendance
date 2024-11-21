import Link from "next/link";

export default function AdminHeader() {
	return (
		<nav className="bg-gray-800 text-white p-4">
			<div className="container mx-auto flex justify-between items-center">
				<div className="flex space-x-4">
					<Link
						href="/attendance"
						className="hover:text-gray-300 transition-colors"
					>
						Take Attendance
					</Link>
				</div>
			</div>
		</nav>
	);
}
