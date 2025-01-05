import { injectMongoDB, getMongoDB } from "../withMongoDB";
import type { WeekId } from "../collections";
import query_getWeeklyGoal from "./query_getWeeklyGoal";
import {
	ActivitiesCollectionName,
	WeekCompletionStatusCollectionName,
	type WeekCompletionStatusCollectionDocument,
} from "../collections";
import type { CompletedActivity, WeeklyGoals } from "../types";
import groupActivities from "../../helpers/activities/groupActivities";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";

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

export interface WeekCompletionStatus {
	weekKey: string;
	attendanceStatus: {
		hasNoGoal: boolean;
		completed: boolean;
		remainingGoals: {
			personalTechnique: number;
			probabilityPractice: number;
			buddyTraining: number;
		};
	};
	runningStatus: {
		hasNoGoal: boolean;
		completed: boolean;
		remainingGoals: {
			enduranceRun: number;
		};
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

async function getAthleteActivities(
	athleteId: string,
	weekRange: WeekRange,
): Promise<GroupedActivities> {
	const db = getMongoDB();
	const activities = await db
		.collection<CompletedActivity>(ActivitiesCollectionName)
		.find({
			attendanceId: athleteId,
			activityTimestamp: {
				$gte: weekRange.start.toMillis(),
				$lt: weekRange.end.toMillis(),
			},
		})
		.toArray();

	return groupActivities(activities);
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

export default injectMongoDB(
	async function query_getAthleteWeekCompletionStatus(
		weekKey: WeekId,
		athleteId: string,
	): Promise<WeekCompletionStatus> {
		const db = getMongoDB();

		// Check if we have a cached status
		const cachedStatus = await db
			.collection<WeekCompletionStatusCollectionDocument>(
				WeekCompletionStatusCollectionName,
			)
			.findOne({
				weekId: weekKey,
				athleteId,
			});

		// Get the latest activity timestamp for this athlete in this week
		const weekRange = getWeekRange(weekKey);
		const latestActivity = await db
			.collection<CompletedActivity>(ActivitiesCollectionName)
			.findOne(
				{
					attendanceId: athleteId,
					activityTimestamp: {
						$gte: weekRange.start.toMillis(),
						$lt: weekRange.end.toMillis(),
					},
				},
				{
					sort: { submittedAt: -1 },
				},
			);

		// If we have a cached status and no new activities since last update, return it
		if (
			cachedStatus &&
			(!latestActivity ||
				latestActivity.submittedAt <= cachedStatus.lastUpdatedAt)
		) {
			return {
				weekKey,
				attendanceStatus: cachedStatus.attendanceStatus,
				runningStatus: cachedStatus.runningStatus,
			};
		}

		// Get weekly goals
		const weeklyGoals = await query_getWeeklyGoal(weekKey);

		// Get activities for this athlete in this week
		const groupedActivities = await getAthleteActivities(athleteId, weekRange);

		// Calculate status
		const attendanceStatus = calculateAttendanceStatus(
			weeklyGoals.goals,
			groupedActivities,
		);
		const runningStatus = calculateRunningStatus(
			weeklyGoals.goals,
			groupedActivities,
		);

		// Update cache
		await db
			.collection<WeekCompletionStatusCollectionDocument>(
				WeekCompletionStatusCollectionName,
			)
			.updateOne(
				{
					weekId: weekKey,
					athleteId,
				},
				{
					$set: {
						id: cachedStatus?.id || nanoid(),
						weekId: weekKey,
						athleteId,
						attendanceStatus,
						runningStatus,
						lastUpdatedAt: Date.now(),
					},
				},
				{ upsert: true },
			);

		return {
			weekKey,
			attendanceStatus,
			runningStatus,
		};
	},
);
