"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [pending, startTransition] = useTransition();

	function onPreviousWeek() {
		const paramsWeekOffset = searchParams.get("weekOffset");
		const weekOffset = paramsWeekOffset ? Number.parseInt(paramsWeekOffset) : 0;

		const newParams = new URLSearchParams(searchParams.toString());
		newParams.set("weekOffset", (weekOffset - 1).toString());

		startTransition(() => {
			router.push(`${pathname}?${newParams.toString()}`);
		});
	}

	function onNextWeek() {
		const paramsWeekOffset = searchParams.get("weekOffset");
		const weekOffset = paramsWeekOffset ? Number.parseInt(paramsWeekOffset) : 0;

		const newParams = new URLSearchParams(searchParams.toString());
		newParams.set("weekOffset", (weekOffset + 1).toString());

		startTransition(() => {
			router.push(`${pathname}?${newParams.toString()}`);
		});
	}

	return (
		<div className="flex items-center gap-2">
			<button
				type="button"
				className="flex items-center gap-1 text-sm hover:bg-gray-50 p-1 rounded whitespace-nowrap"
				onClick={onPreviousWeek}
			>
				<ChevronLeft className="h-4 w-4" />
				<span className="hidden sm:inline">Previous Week</span>
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
					"flex items-center gap-1 text-sm hover:bg-gray-50 p-1 rounded whitespace-nowrap",
					disableNextWeek && "opacity-50 cursor-not-allowed",
				)}
				onClick={onNextWeek}
				disabled={disableNextWeek}
			>
				<span className="hidden sm:inline">Next Week</span>
				<ChevronRight className="h-4 w-4" />
			</button>
		</div>
	);
}
