import {
	type ActivitiesCollectionDocument,
	ActivitiesCollectionName,
	type WeekId,
	type AchievementCollectionDocument,
	AchievementsCollectionName,
} from "../collections";
import { getMongoDB, injectMongoDB } from "../withMongoDB";
import {
	achievementReducer,
	type AchievementState,
	type WeeklyGoalsMap,
} from "./achievementReducer";
import {
	unstable_cacheLife as cacheLife,
	unstable_cacheTag as cacheTag,
} from "next/cache";
import { DateTime } from "luxon";
import query_getWeeklyGoal from "./query_getWeeklyGoal";
import { nanoid } from "nanoid";

export default injectMongoDB(async function query_getAchievementForAthlete(
	athleteId: string,
): Promise<AchievementState> {
	cacheLife("hours");
	cacheTag("achievement_aggregation");

	const db = getMongoDB();
	const activitiesCollection = db.collection<ActivitiesCollectionDocument>(
		ActivitiesCollectionName,
	);
	const achievementsCollection = db.collection<AchievementCollectionDocument>(
		AchievementsCollectionName,
	);

	// Get the current achievement state from the database
	const currentAchievement = await achievementsCollection.findOne({
		athleteId,
	});

	// Get all activities for this athlete after the last processed activity
	let query: { attendanceId: string; activityTimestamp?: { $gt: number } } = {
		attendanceId: athleteId,
	};
	if (currentAchievement?.lastActivityId) {
		const lastActivity = await activitiesCollection.findOne({
			id: currentAchievement.lastActivityId,
		});
		if (lastActivity) {
			query = {
				...query,
				activityTimestamp: { $gt: lastActivity.activityTimestamp },
			};
		}
	}

	const activities = await activitiesCollection
		.find(query)
		.sort({ activityTimestamp: 1 })
		.toArray();

	// If there are no new activities and we have a saved state, return it
	if (activities.length === 0 && currentAchievement) {
		return currentAchievement.state;
	}

	// Initialize state from saved achievement or empty state
	const initialState: AchievementState = currentAchievement?.state ?? {
		currentWeek: "",
		weeklyActivities: {
			enduranceRun: 0,
			personalTechnique: 0,
			probabilityPractice: 0,
			buddyTraining: 0,
		},
		streaks: {
			currentAttendanceStreak: 0,
			bestAttendanceStreak: 0,
			currentRunningStreak: 0,
			bestRunningStreak: 0,
			lastAttendanceStreakWeek: null,
			lastRunningStreakWeek: null,
		},
		bestRun: {
			minutesPerLap: 0,
			laps: 0,
			minutes: 0,
			timestamp: 0,
		},
		lastActivityId: null,
	};

	// Create a goals map by fetching goals for each week
	const goalsMap: WeeklyGoalsMap = {};

	// If we have a saved state, make sure to include goals for the current week
	if (currentAchievement?.state.currentWeek) {
		const weekId =
			`${currentAchievement.state.currentWeek.replace("-", "-W")}` as WeekId;
		const weeklyGoal = await query_getWeeklyGoal(weekId);
		goalsMap[currentAchievement.state.currentWeek] = weeklyGoal.goals;
	}

	// Add goals for all new activities
	for (const activity of activities) {
		const weekKey = getWeekKey(activity.activityTimestamp);
		if (!goalsMap[weekKey]) {
			const weekId = `${weekKey.replace("-", "-W")}` as WeekId;
			const weeklyGoal = await query_getWeeklyGoal(weekId);
			goalsMap[weekKey] = weeklyGoal.goals;
		}
	}

	// Reduce all activities to get the final state
	const state = activities.reduce(
		(state, activity) => achievementReducer(state, activity, goalsMap),
		initialState,
	);

	// Save the achievement state
	await achievementsCollection.updateOne(
		{ athleteId },
		{
			$set: {
				state,
				lastActivityId: state.lastActivityId,
				updatedAt: Date.now(),
			},
			$setOnInsert: {
				id: nanoid(),
				athleteId,
			},
		},
		{ upsert: true },
	);

	return state;
});

function getWeekKey(timestamp: number): string {
	const dt = DateTime.fromMillis(timestamp, { zone: "Asia/Saigon" });
	return `${dt.year}-${dt.weekNumber}`;
}
