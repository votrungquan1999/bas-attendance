import { Skeleton } from "src/shadcn/components/ui/skeleton";
import {
	PracticeList,
	PracticeListItem,
	PracticeHeader,
	PracticeInfo,
	PracticeActions,
	PracticeStats,
} from "./practice_list.ui";

export function PracticeListSkeleton() {
	return (
		<PracticeList>
			<PracticeListItemSkeleton />
			<PracticeListItemSkeleton />
			<PracticeListItemSkeleton />
		</PracticeList>
	);
}

export function PracticeListItemSkeleton() {
	return (
		<PracticeListItem>
			<PracticeHeader>
				<PracticeInfo>
					{/* Practice Date */}
					<Skeleton className="h-6 w-64 mb-1" />
					{/* Updated Date */}
					<Skeleton className="h-4 w-48" />
				</PracticeInfo>
				<PracticeActions>
					{/* Status Badge */}
					<Skeleton className="h-6 w-16 rounded-full" />
					{/* View Button */}
					<Skeleton className="h-4 w-20" />
				</PracticeActions>
			</PracticeHeader>

			<PracticeStats>
				{/* Registered count */}
				<Skeleton className="h-4 w-24" />
				{/* Total records */}
				<Skeleton className="h-4 w-28" />
			</PracticeStats>
		</PracticeListItem>
	);
}
