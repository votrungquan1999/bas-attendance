import Link from "next/link";

export default function BrowseWeekHeader() {
	return (
		<div className="flex items-center gap-4">
			<h1 className="text-2xl font-bold">Browse Weekly Goals</h1>
			<div className="h-8 w-px bg-gray-300" aria-hidden="true" />
			<Link
				href="/admin/settings/weekly-goals/by-week"
				className="text-blue-500 hover:text-blue-600 transition-colors"
			>
				Go to This Week&apos;s Goals
			</Link>
		</div>
	);
}
