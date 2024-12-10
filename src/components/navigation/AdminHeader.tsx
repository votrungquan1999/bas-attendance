import Link from "next/link";
import { Suspense } from "react";
import UserPopover from "../next_auth/UserPopover";
import UserPopoverSkeleton from "../next_auth/UserPopoverSkeleton";

export default function AdminHeader() {
	return (
		<nav className="bg-gray-800 p-4 text-white">
			<div className="container mx-auto flex items-center justify-between">
				<div className="flex space-x-4">
					<Link
						href="/attendance"
						className="transition-colors hover:text-gray-300"
					>
						Take Attendance
					</Link>
				</div>

				<Suspense fallback={<UserPopoverSkeleton />}>
					<UserPopover />
				</Suspense>
			</div>
		</nav>
	);
}
