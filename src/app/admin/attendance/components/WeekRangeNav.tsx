"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "src/shadcn/lib/utils";

interface WeekRange {
	start: Date;
	end: Date;
}

interface WeekRangeNavProps {
	weekRange: WeekRange;
	disableNextWeek?: boolean;
}

export default function WeekRangeNav({
	weekRange,
	disableNextWeek = false,
}: WeekRangeNavProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [pending, startTransition] = useTransition();

	function onPreviousWeek() {
		const paramsWeekOffset = searchParams.get("weekOffset");
		const weekOffset = paramsWeekOffset ? Number.parseInt(paramsWeekOffset) : 0;

		const newParams = new URLSearchParams(searchParams.toString());
		newParams.set("weekOffset", (weekOffset - 1).toString());

		startTransition(() => {
			router.push(`/admin/attendance/by-week?${newParams.toString()}`);
		});
	}

	function onNextWeek() {
		const paramsWeekOffset = searchParams.get("weekOffset");
		const weekOffset = paramsWeekOffset ? Number.parseInt(paramsWeekOffset) : 0;

		const newParams = new URLSearchParams(searchParams.toString());
		newParams.set("weekOffset", (weekOffset + 1).toString());

		startTransition(() => {
			router.push(`/admin/attendance/by-week?${newParams.toString()}`);
		});
	}

	return (
		<div className="flex items-center gap-2">
			<button
				type="button"
				className="flex items-center gap-1 text-sm hover:bg-gray-50 p-1 rounded"
				onClick={onPreviousWeek}
			>
				<ChevronLeft className="h-4 w-4 mr-1" />
				Previous Week
			</button>
			<div
				className={cn(
					"text-sm font-medium text-slate-800 flex items-center flex-row",
					pending && "animate-pulse",
				)}
			>
				{weekRange.start.toLocaleDateString("vi-VN", {
					timeZone: "Asia/Saigon",
				})}{" "}
				-{" "}
				{weekRange.end.toLocaleDateString("vi-VN", {
					timeZone: "Asia/Saigon",
				})}
				<Loader2
					className={cn("h-4 w-4 ml-1 animate-spin", !pending && "invisible")}
				/>
			</div>
			<button
				type="button"
				className={cn(
					"flex items-center gap-1 text-sm hover:bg-gray-50 p-1 rounded",
					disableNextWeek && "opacity-50 cursor-not-allowed",
				)}
				onClick={onNextWeek}
				disabled={disableNextWeek}
			>
				Next Week
				<ChevronRight className="h-4 w-4 ml-1" />
			</button>
		</div>
	);
}
