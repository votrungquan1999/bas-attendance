import DataLoader from "dataloader";
import { getMongoDB, injectMongoDB } from "../withMongoDB";
import type { WeekId } from "../collections";
import type { CompletedActivity, WeeklyGoals } from "../types";
import {
	ActivitiesCollectionName,
	WeekCompletionStatusCollectionName,
	type WeekCompletionStatusCollectionDocument,
} from "../collections";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";
import groupActivities from "../../helpers/activities/groupActivities";
import query_getWeeklyGoal from "../queries/query_getWeeklyGoal";

interface WeekAthleteKey {
	weekId: WeekId;
	athleteId: string;
}

interface GroupedActivities {
	thirtyMinSessions: {
		probabilityPractice: CompletedActivity[];
		personalTechnique: CompletedActivity[];
		buddyTraining: CompletedActivity[];
	};
	enduranceRuns: CompletedActivity[];
	normalSessions: {
		trainNewbies: CompletedActivity[];
		trainWithCoach: CompletedActivity[];
		others: CompletedActivity[];
	};
}

interface WeekRange {
	start: DateTime;
	end: DateTime;
}

function getWeekRange(weekKey: WeekId): WeekRange {
	const weekStart = DateTime.fromISO(weekKey)
		.setZone("Asia/Saigon")
		.startOf("week");
	return {
		start: weekStart,
		end: weekStart.plus({ weeks: 1 }),
	};
}

function calculateAttendanceStatus(
	goals: WeeklyGoals,
	groupedActivities: GroupedActivities,
) {
	const hasNoGoal =
		goals.thirtyMin.personalTechnique === 0 &&
		goals.thirtyMin.probabilityPractice === 0 &&
		goals.thirtyMin.buddyTraining === 0;

	const remainingGoals = {
		personalTechnique: Math.max(
			0,
			goals.thirtyMin.personalTechnique -
				(groupedActivities.thirtyMinSessions.personalTechnique?.length || 0),
		),
		probabilityPractice: Math.max(
			0,
			goals.thirtyMin.probabilityPractice -
				(groupedActivities.thirtyMinSessions.probabilityPractice?.length || 0),
		),
		buddyTraining: Math.max(
			0,
			goals.thirtyMin.buddyTraining -
				(groupedActivities.thirtyMinSessions.buddyTraining?.length || 0),
		),
	};

	const completed =
		remainingGoals.personalTechnique === 0 &&
		remainingGoals.probabilityPractice === 0 &&
		remainingGoals.buddyTraining === 0;

	return {
		hasNoGoal,
		completed,
		remainingGoals,
	};
}

function calculateRunningStatus(
	goals: WeeklyGoals,
	groupedActivities: GroupedActivities,
) {
	const hasNoGoal = goals.enduranceRun === 0;

	const remainingEnduranceRun = Math.max(
		0,
		goals.enduranceRun - groupedActivities.enduranceRuns.length,
	);

	return {
		hasNoGoal,
		completed: remainingEnduranceRun === 0,
		remainingGoals: {
			enduranceRun: remainingEnduranceRun,
		},
	};
}

async function batchGetWeekCompletionStatus(
	keys: readonly WeekAthleteKey[],
): Promise<WeekCompletionStatusCollectionDocument[]> {
	const db = getMongoDB();

	// Get all cached statuses
	const cachedStatuses = await db
		.collection<WeekCompletionStatusCollectionDocument>(
			WeekCompletionStatusCollectionName,
		)
		.find({
			$or: keys.map((key) => ({
				weekId: key.weekId,
				athleteId: key.athleteId,
			})),
		})
		.toArray();

	// Get all activities for all weeks and athletes
	const weekRanges = new Map(
		keys.map((key) => [key.weekId, getWeekRange(key.weekId)]),
	);

	const activities = await db
		.collection<CompletedActivity>(ActivitiesCollectionName)
		.find({
			$or: Array.from(weekRanges.entries()).flatMap(([, range]) => [
				{
					attendanceId: { $in: keys.map((k) => k.athleteId) },
					activityTimestamp: {
						$gte: range.start.toMillis(),
						$lt: range.end.toMillis(),
					},
				},
			]),
		})
		.toArray();

	// Get all weekly goals
	const weeklyGoals = await Promise.all(
		Array.from(new Set(keys.map((k) => k.weekId))).map((weekId) =>
			query_getWeeklyGoal(weekId),
		),
	);
	const weeklyGoalsMap = new Map(
		weeklyGoals.map((goal) => [goal.weekId, goal.goals]),
	);

	// Process each key
	const results = await Promise.all(
		keys.map(async (key) => {
			const cachedStatus = cachedStatuses.find(
				(status) =>
					status.weekId === key.weekId && status.athleteId === key.athleteId,
			);

			const weekRange = weekRanges.get(key.weekId);
			if (!weekRange) {
				throw new Error(`Week range not found for weekId: ${key.weekId}`);
			}

			const weeklyGoal = weeklyGoalsMap.get(key.weekId);
			if (!weeklyGoal) {
				throw new Error(`Weekly goal not found for weekId: ${key.weekId}`);
			}

			// Get latest activity for this athlete in this week
			const athleteActivities = activities.filter(
				(activity) =>
					activity.attendanceId === key.athleteId &&
					activity.activityTimestamp >= weekRange.start.toMillis() &&
					activity.activityTimestamp < weekRange.end.toMillis(),
			);

			const latestActivity = athleteActivities.reduce(
				(latest, current) =>
					!latest || current.submittedAt > latest.submittedAt
						? current
						: latest,
				null as CompletedActivity | null,
			);

			// If we have a cached status and no new activities since last update, return it
			if (
				cachedStatus &&
				(!latestActivity ||
					latestActivity.submittedAt <= cachedStatus.lastUpdatedAt)
			) {
				return cachedStatus;
			}

			// Calculate new status
			const groupedActivities = groupActivities(athleteActivities);
			const attendanceStatus = calculateAttendanceStatus(
				weeklyGoal,
				groupedActivities,
			);
			const runningStatus = calculateRunningStatus(
				weeklyGoal,
				groupedActivities,
			);

			// Create new status document
			const newStatus: WeekCompletionStatusCollectionDocument = {
				id: cachedStatus?.id || nanoid(),
				weekId: key.weekId,
				athleteId: key.athleteId,
				attendanceStatus,
				runningStatus,
				lastUpdatedAt: Date.now(),
			};

			// Update cache
			await db
				.collection<WeekCompletionStatusCollectionDocument>(
					WeekCompletionStatusCollectionName,
				)
				.updateOne(
					{
						weekId: key.weekId,
						athleteId: key.athleteId,
					},
					{
						$set: newStatus,
					},
					{ upsert: true },
				);

			return newStatus;
		}),
	);

	return results;
}

export const weekCompletionStatusLoader = new DataLoader<
	WeekAthleteKey,
	WeekCompletionStatusCollectionDocument
>(
	injectMongoDB(async (keys) => {
		const results = await batchGetWeekCompletionStatus(keys);
		return keys.map((key) => {
			const result = results.find(
				(result) =>
					result.weekId === key.weekId && result.athleteId === key.athleteId,
			);
			if (!result) {
				throw new Error(
					`Result not found for weekId: ${key.weekId}, athleteId: ${key.athleteId}`,
				);
			}
			return result;
		});
	}),
);
