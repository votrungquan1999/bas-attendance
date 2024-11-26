import { groupBy } from "lodash/fp";
import type { CompletedActivity } from "src/app/attendance/activity/types";
import { getTakers } from "src/app/attendance/taker/getTakers";
import type { WeekRange } from "src/helpers/weekRange";
import {
	type ActivitiesCollection,
	ActivitiesCollectionName,
} from "src/server/collections";
import getDB from "src/server/db";

export type AttendanceData = {
	athleteName: string;
	activities: CompletedActivity[];
};

export default async function query_getAttendanceData(
	weekRange: WeekRange,
): Promise<AttendanceData[]> {
	const { db, close } = await getDB();

	const activitiesCollection = db.collection<ActivitiesCollection>(
		ActivitiesCollectionName,
	);

	const activities = await activitiesCollection
		.find({
			activityTimestamp: {
				$gte: weekRange.start.getTime(),
				$lte: weekRange.end.getTime(),
			},
		})
		.toArray();

	const groupedByAttendanceId = groupBy("attendanceId", activities);

	const takers = await getTakers();

	const attendanceData = Object.entries(groupedByAttendanceId).flatMap(
		([attendanceId, activities]) => {
			const taker = takers.find((taker) => taker.id === attendanceId);

			// skip test user and not assigned taker
			if (!taker || taker.id === "test_user") {
				return [];
			}

			return {
				athleteName: taker?.value,
				activities,
			};
		},
	);

	await close();

	return attendanceData;
}
