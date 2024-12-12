import { Suspense } from "react";
import UserPopover from "src/components/next_auth/UserPopover";
import UserPopoverSkeleton from "src/components/next_auth/UserPopoverSkeleton";

export default function AdminHeader({
	children,
}: { children: React.ReactNode }) {
	return (
		<header className="flex h-[72px] w-full items-center border-b border-slate-200 bg-white shadow">
			<div className="px-6">{children}</div>

			<div className="flex-1" />

			<div className="px-6">
				<Suspense fallback={<UserPopoverSkeleton />}>
					<UserPopover />
				</Suspense>
			</div>
		</header>
	);
}
