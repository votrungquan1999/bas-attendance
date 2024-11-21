import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeekRange {
	start: Date;
	end: Date;
}

interface WeekRangeNavProps {
	weekRange: WeekRange;
	onPreviousWeek?: () => void;
	onNextWeek?: () => void;
	disableNextWeek?: boolean;
}

export default function WeekRangeNav({
	weekRange,
	onPreviousWeek,
	onNextWeek,
	disableNextWeek = false,
}: WeekRangeNavProps) {
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
			<div className="text-sm font-medium">
				{weekRange.start.toLocaleDateString()} -{" "}
				{weekRange.end.toLocaleDateString()}
			</div>
			<button
				type="button"
				className="flex items-center gap-1 text-sm hover:bg-gray-50 p-1 rounded"
				onClick={onNextWeek}
				disabled={disableNextWeek}
			>
				Next Week
				<ChevronRight className="h-4 w-4 ml-1" />
			</button>
		</div>
	);
}
