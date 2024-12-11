import { CircleIcon } from "lucide-react";

export default function UserPopoverSkeleton() {
	return (
		<div className="h-10 w-10 animate-pulse rounded-full bg-slate-200">
			<CircleIcon className="h-6 w-6 text-slate-400" />
		</div>
	);
}
