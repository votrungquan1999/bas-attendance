import WeekRangeNav from "src/components/attendance_records/WeekRangeNav";
import ThirtyMinutesSessionsProgress from "src/components/attendance_records/ThirtyMinutesSessionsProgress";
import NormalLongSessionsProgress from "src/components/attendance_records/NormalLongSessionsProgress";
import EnduranceRunsProgress from "src/components/attendance_records/EnduranceRunsProgress";
import YearlyStreakView from "src/components/attendance_records/YearlyStreakView/YearlyStreakView";
import getWeekRange, { type WeekRange } from "src/helpers/weekRange";
import groupActivities from "src/helpers/activities/groupActivities";
import query_getTakerFromCookies from "../../../../server/queries/query_getTakerFromCookies";
import action_resetTaker from "../../../../server/actions/action_resetTaker";
import { query_getSelectedYear } from "../../../../server/actions/action_handleSelectYear";
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
	const selectedYear = await query_getSelectedYear();

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

				<YearlyStreakView year={selectedYear} />
			</div>
		</main>
	);
}
