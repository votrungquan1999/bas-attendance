import getWeekRange from "src/helpers/weekRange";
import { DateTime } from "luxon";
import Link from "next/link";
import { CalendarIcon } from "lucide-react";

export default async function WeeklyGoals({
	searchParams,
}: {
	searchParams: Promise<{ weekOffset: string | undefined }>;
}) {
	const { weekOffset } = await searchParams;
	const weekRange = await getWeekRange(Number(weekOffset ?? "0"));

	const startDate = DateTime.fromJSDate(weekRange.start, {
		zone: "Asia/Saigon",
	});
	const endDate = DateTime.fromJSDate(weekRange.end, { zone: "Asia/Saigon" });

	const isCurrentWeek = weekOffset === undefined || Number(weekOffset) === 0;

	return (
		<div className="flex items-center gap-4">
			<h1 className="text-2xl font-bold">Weekly Goals Settings</h1>
			<div className="h-8 w-px bg-gray-300" aria-hidden="true" />
			<Link
				href="/admin/settings/weekly-goals/browse-week"
				className="group flex items-center gap-2 text-gray-500 text-lg hover:text-blue-500 transition-colors"
			>
				{isCurrentWeek ? (
					"Current Week"
				) : (
					<>
						{startDate.toLocaleString({
							day: "numeric",
							month: "short",
							weekday: "short",
						})}
						<span className="mx-2">→</span>
						{endDate.toLocaleString({
							day: "numeric",
							month: "short",
							weekday: "short",
						})}
					</>
				)}
				<CalendarIcon className="w-4 h-4" />
			</Link>
		</div>
	);
}
