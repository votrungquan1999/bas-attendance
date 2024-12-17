import getWeekRange from "src/helpers/weekRange";
import { WeeklyGoalsProvider } from "./WeeklyGoalsProvider";
import WeekRangeNav from "src/components/attendance_records/WeekRangeNav";
import WeeklyGoalsClientWrapper from "./WeeklyGoalsClientWrapper";
import { DateTime } from "luxon";
import query_getWeeklyGoal from "src/server/queries/query_getWeeklyGoal";
import type { WeekId } from "src/server/collections";
import SaveWeeklyGoalButton from "./SaveWeeklyGoalButton";

export default async function WeeklyGoalsSettings({
	searchParams,
}: {
	searchParams: Promise<{ weekOffset: string | undefined }>;
}) {
	const { weekOffset } = await searchParams;
	const weekRange = await getWeekRange(Number(weekOffset ?? "0"));

	// Get the week ID using Luxon from the start date
	const startDate = DateTime.fromJSDate(weekRange.start).setZone("Asia/Saigon");
	const weekId = startDate.toFormat("yyyy-'W'WW") as WeekId;

	const weeklyGoals = await query_getWeeklyGoal(weekId);

	return (
		<div className="p-6 max-w-4xl mx-auto space-y-6">
			<div className="flex items-center bg-white rounded-md p-4 shadow">
				<WeekRangeNav weekRange={weekRange} />
			</div>
			<WeeklyGoalsProvider initialState={weeklyGoals.goals}>
				<WeeklyGoalsClientWrapper />

				<div className="flex justify-end">
					<SaveWeeklyGoalButton weekId={weekId} />
				</div>
			</WeeklyGoalsProvider>
		</div>
	);
}
