import { Suspense } from "react";
import UserPopover from "../next_auth/UserPopover";
import UserPopoverSkeleton from "../next_auth/UserPopoverSkeleton";

export default function AdminHeader() {
	return (
		<header className="flex h-[72px] w-full items-center justify-end border-b border-slate-200 bg-white shadow">
			<div className="px-6">
				<Suspense fallback={<UserPopoverSkeleton />}>
					<UserPopover />
				</Suspense>
			</div>
		</header>
	);
}
