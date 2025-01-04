import WeekRangeNav from "src/components/attendance_records/WeekRangeNav";
import ThirtyMinutesSessionsProgress from "src/components/attendance_records/ThirtyMinutesSessionsProgress";
import NormalLongSessionsProgress from "src/components/attendance_records/NormalLongSessionsProgress";
import EnduranceRunsProgress from "src/components/attendance_records/EnduranceRunsProgress";
import YearlyStreakView from "src/components/attendance_records/YearlyStreakView/YearlyStreakView";
import getWeekRange, { type WeekRange } from "src/helpers/weekRange";
import groupActivities from "src/helpers/activities/groupActivities";
import query_getTakerFromCookies from "../../../../server/queries/query_getTakerFromCookies";
import action_resetTaker from "../../../../server/actions/action_resetTaker";
import type { ActivitiesCollectionDocument } from "src/server/collections";
import getDB from "src/server/db";
import { ActivitiesCollectionName } from "src/server/collections";
import { WEEKLY_GOALS } from "src/server/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Basketball Attendance - Training History",
};

async function query_getAthleteAttendanceData(
	weekRange: WeekRange,
	takerId: string,
): Promise<ActivitiesCollectionDocument[]> {
	const { db, close } = await getDB();

	const activitiesCollection = db.collection<ActivitiesCollectionDocument>(
		ActivitiesCollectionName,
	);

	const activities = await activitiesCollection
		.find({
			activityTimestamp: {
				$gte: weekRange.start.getTime(),
				$lte: weekRange.end.getTime(),
			},
			attendanceId: takerId,
		})
		.toArray();

	await close();

	return activities;
}

export default async function HistoryPage({
	searchParams,
}: {
	searchParams: Promise<{ weekOffset?: string }>;
}) {
	const paramsWeekOffset = (await searchParams).weekOffset;
	const weekOffset = paramsWeekOffset ? Number.parseInt(paramsWeekOffset) : 0;
	const weekRange = await getWeekRange(weekOffset);

	const taker = await query_getTakerFromCookies();

	// Get attendance data for the current user
	const attendanceData = await query_getAthleteAttendanceData(
		weekRange,
		taker.id,
	);
	const groupedActivities = groupActivities(attendanceData);

	const totalActivities = attendanceData.length;

	return (
		<main className="flex-1 bg-gray-50 flex flex-col relative">
			<header className="bg-white shadow-sm">
				<div className="max-w-2xl mx-auto px-6 py-8">
					<div className="mb-6">
						<h1 className="text-2xl font-bold text-slate-600 font-inter mb-1">
							Hello{" "}
							<span className="font-satisfy text-4xl text-blue-600">
								{taker.name}
							</span>
							! 👋
						</h1>

						<form action={action_resetTaker}>
							<button
								type="submit"
								className="text-sm text-gray-500 hover:text-gray-700 underline"
							>
								Not {taker.name}? Click here to switch user
							</button>
						</form>
					</div>

					<h2 className="text-xl text-gray-600 font-inter">Training History</h2>
				</div>
			</header>

			<div className="px-4 sm:px-6 mx-auto max-w-2xl w-full -mt-4">
				<div className="bg-white shadow-md rounded-xl px-6 py-4 border border-gray-100">
					<div className="flex items-center justify-between gap-4 flex-wrap">
						<p className="text-gray-600">
							You have recorded{" "}
							<span className="font-medium text-blue-600">
								{totalActivities} activities
							</span>{" "}
							this week
						</p>

						<WeekRangeNav
							weekRange={weekRange}
							disableNextWeek={weekOffset === 0}
						/>
					</div>
				</div>
			</div>

			<div className="mx-auto px-4 py-4 sm:px-6 sm:py-8 space-y-6 max-w-2xl w-full">
				<ThirtyMinutesSessionsProgress
					groupedActivities={groupedActivities.thirtyMinSessions}
					goals={WEEKLY_GOALS.thirtyMin}
				/>

				<EnduranceRunsProgress
					activities={groupedActivities.enduranceRuns}
					goal={WEEKLY_GOALS.enduranceRun}
				/>

				<NormalLongSessionsProgress
					groupedActivities={groupedActivities.normalSessions}
					goals={WEEKLY_GOALS.normalSession}
				/>

				<YearlyStreakView
					year={2025}
					completedWeeks={[
						"2024-01",
						"2024-02",
						"2024-03",
						"2024-04",
						"2024-05",
						"2024-06",
						"2024-07",
						"2024-08",
						"2024-09",
						"2024-10",
						"2024-12",
						"2024-13",
						"2024-14",
						"2024-15",
						"2024-16",
						"2024-17",
						"2024-18",
						"2024-19",
						"2024-21",
						"2024-22",
						"2024-23",
						"2024-24",
						"2024-25",
						"2024-26",
						"2024-27",
						"2024-31",
						"2024-32",
						"2024-33",
						"2024-34",
						"2024-35",
						"2024-41",
						"2024-42",
						"2024-43",
						"2024-44",
						"2024-45",
						"2024-51",
						"2024-52",
						"2025-01",
					]}
					weeksWithoutGoals={[
						"2024-11",
						"2024-20",
						"2024-28",
						"2024-29",
						"2024-30",
						"2024-36",
						"2024-37",
						"2024-38",
						"2024-39",
						"2024-40",
						"2024-46",
						"2024-47",
						"2024-48",
						"2024-49",
						"2024-50",
					]}
				/>
			</div>
		</main>
	);
}
