import getWeekRange from "src/helpers/weekRange";
import { WeeklyGoalsProvider } from "./WeeklyGoalsProvider";
import WeekRangeNav from "src/components/attendance_records/WeekRangeNav";
import WeeklyGoalsClientWrapper from "./WeeklyGoalsClientWrapper";

export default async function WeeklyGoalsSettings({
	searchParams,
}: {
	searchParams: Promise<{ weekOffset: string | undefined }>;
}) {
	const { weekOffset } = await searchParams;
	const weekRange = await getWeekRange(Number(weekOffset ?? "0"));

	return (
		<div className="p-6 max-w-4xl mx-auto space-y-6">
			<div className="flex items-center bg-white rounded-md p-4 shadow">
				<WeekRangeNav weekRange={weekRange} />
			</div>
			<WeeklyGoalsProvider>
				<WeeklyGoalsClientWrapper />
			</WeeklyGoalsProvider>
		</div>
	);
}
