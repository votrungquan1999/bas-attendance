import { describe, it, expect, afterAll } from "bun:test";
import query_getAchievementForAthlete from "../query_getAchievementForAthlete";
import {
	type ActivitiesCollectionDocument,
	type WeeklyGoalsCollectionDocument,
	type WeekId,
	type AchievementCollectionDocument,
	WeeklyGoalsCollectionName,
	ActivitiesCollectionName,
	AchievementsCollectionName,
} from "src/server/collections";
import withTestContext, { cleanUp } from "src/helpers/withTestContext";
import { getMongoDB } from "src/server/withMongoDB";
import { DateTime } from "luxon";
import type { WeeklyGoals } from "src/server/types";
import { nanoid } from "nanoid";

// behavior:
// 1. the achievement state is saved in the database
// if there is no saved state, we should calculate the achievement from scratch
// 2. if there is a saved state, get the last activity from the saved state
// if can't find the last activity, we should calculate the achievement from scratch
// 3. if can find the last activity, get all activities for the athlete after the last activity
// 4. calculate the achievement
// if throw NoGoalFoundError, get the goal id, then ensure the goal id is in the goals map
// trigger the calculation again
// 5. save the achievement

describe("query_getAchievementForAthlete", () => {
	afterAll(async () => {
		await cleanUp();
	});

	const DEFAULT_WEEKLY_GOALS: WeeklyGoals = {
		thirtyMin: {
			personalTechnique: 2,
			probabilityPractice: 1,
			buddyTraining: 1,
		},
		enduranceRun: 2,
		normalSession: {
			trainWithCoach: 1,
			trainNewbies: 1,
		},
	};

	async function setupWeeklyGoals(
		weekId: WeekId,
		goals: WeeklyGoals = DEFAULT_WEEKLY_GOALS,
	) {
		const db = getMongoDB();
		await db
			.collection<WeeklyGoalsCollectionDocument>(WeeklyGoalsCollectionName)
			.insertOne({
				id: nanoid(),
				weekId,
				goals,
				updatedAt: Date.now(),
				updatedBy: "test",
			});
	}

	const generateWeekActivities = async (
		athleteId: string,
		timestamp: number,
		includeRun = true,
	): Promise<void> => {
		// get last activity id
		const db = getMongoDB();
		const lastActivity = await db
			.collection<ActivitiesCollectionDocument>(ActivitiesCollectionName)
			.findOne(
				{
					attendanceId: athleteId,
				},
				{
					sort: { activityTimestamp: -1 },
				},
			);

		const lastActivityId: number = lastActivity
			? Number.parseInt(lastActivity.id)
			: 0;

		// for new activities, the id should be lastActivityId + 1, +2, +3, ...
		// each activity should have a different timestamp, incrementing by 1 hour
		const oneHour = 60 * 60 * 1000;
		const activities = [
			// Personal Technique (2 required)
			{
				id: String(lastActivityId + 1),
				attendanceId: athleteId,
				activity: "30-minutes-session",
				thirtyMinActivity: "personal-technique",
				thirtyMinExplanation: "Practice personal technique",
				activityTimestamp: timestamp + 0 * oneHour,
				submittedAt: timestamp + 0 * oneHour,
			},
			{
				id: String(lastActivityId + 2),
				attendanceId: athleteId,
				activity: "30-minutes-session",
				thirtyMinActivity: "personal-technique",
				thirtyMinExplanation: "Practice personal technique",
				activityTimestamp: timestamp + oneHour,
				submittedAt: timestamp + oneHour,
			},
			// Probability Practice (1 required)
			{
				id: String(lastActivityId + 3),
				attendanceId: athleteId,
				activity: "30-minutes-session",
				thirtyMinActivity: "probability-practice",
				practiceType: "layup",
				practiceLevel: "1",
				practiceDescription: "Practice layup",
				activityTimestamp: timestamp + 2 * oneHour,
				submittedAt: timestamp + 2 * oneHour,
			},
			// Buddy Training (1 required)
			{
				id: String(lastActivityId + 4),
				attendanceId: athleteId,
				activity: "30-minutes-session",
				thirtyMinActivity: "buddy-training",
				thirtyMinExplanation: "Train with buddy",
				activityTimestamp: timestamp + 3 * oneHour,
				submittedAt: timestamp + 3 * oneHour,
			},
			...(includeRun
				? ([
						// Endurance Run (2 required)
						{
							id: String(lastActivityId + 5),
							attendanceId: athleteId,
							activity: "endurance-run",
							laps: "8",
							minutes: "48",
							activityTimestamp: timestamp + 4 * oneHour,
							submittedAt: timestamp + 4 * oneHour,
						},
						{
							id: String(lastActivityId + 6),
							attendanceId: athleteId,
							activity: "endurance-run",
							laps: "8",
							minutes: "48",
							activityTimestamp: timestamp + 5 * oneHour,
							submittedAt: timestamp + 5 * oneHour,
						},
					] as const)
				: []),
		] as const;

		await db
			.collection<ActivitiesCollectionDocument>(ActivitiesCollectionName)
			.insertMany(activities);
	};

	it(
		"should calculate achievement from scratch when there is no saved state",
		withTestContext(async () => {
			const db = getMongoDB();
			const achievementsCollection =
				db.collection<AchievementCollectionDocument>(
					AchievementsCollectionName,
				);

			const timestamp = Date.now() - 7 * 24 * 60 * 60 * 1000;
			const weekId =
				`${DateTime.fromMillis(timestamp, { zone: "Asia/Saigon" }).toFormat("yyyy-'W'WW")}` as WeekId;
			await setupWeeklyGoals(weekId);

			await generateWeekActivities("athlete1", timestamp);

			// Verify no saved state exists
			const savedAchievement = await achievementsCollection.findOne({
				athleteId: "athlete1",
			});
			expect(savedAchievement).toBeNull();

			// Calculate achievement
			const result = await query_getAchievementForAthlete("athlete1");

			// Verify achievement is calculated correctly
			expect(result.streaks.currentAttendanceStreak).toBe(1);
			expect(result.streaks.bestAttendanceStreak).toBe(1);
			expect(result.streaks.currentRunningStreak).toBe(1);
			expect(result.streaks.bestRunningStreak).toBe(1);
			expect(result.lastActivityId).toBe("6");
		}),
	);

	it(
		"should calculate achievement from scratch when last activity is not found",
		withTestContext(async () => {
			const db = getMongoDB();
			const achievementsCollection =
				db.collection<AchievementCollectionDocument>(
					AchievementsCollectionName,
				);

			const timestamp = Date.now() - 7 * 24 * 60 * 60 * 1000;
			const dt = DateTime.fromMillis(timestamp, { zone: "Asia/Saigon" });
			const weekId =
				`${dt.year}-W${dt.weekNumber.toString().padStart(2, "0")}` as WeekId;
			await setupWeeklyGoals(weekId);

			// Save achievement state with non-existent lastActivityId
			await achievementsCollection.insertOne({
				id: nanoid(),
				athleteId: "athlete1",
				state: {
					currentWeek: `${dt.year}-${dt.weekNumber}`,
					weeklyActivities: {
						enduranceRun: 1,
						personalTechnique: 1,
						probabilityPractice: 1,
						buddyTraining: 1,
					},
					streaks: {
						currentAttendanceStreak: 1,
						bestAttendanceStreak: 1,
						currentRunningStreak: 1,
						bestRunningStreak: 1,
						lastAttendanceStreakWeek: `${dt.year}-${dt.weekNumber}`,
						lastRunningStreakWeek: `${dt.year}-${dt.weekNumber}`,
					},
					bestRun: {
						minutesPerLap: 6,
						laps: 8,
						minutes: 48,
						timestamp,
					},
					lastActivityId: "non-existent-id",
				},
				lastActivityId: "non-existent-id",
				updatedAt: Date.now(),
			});

			// Add new activities
			await generateWeekActivities("athlete1", timestamp);

			// Calculate achievement
			const result = await query_getAchievementForAthlete("athlete1");

			// Verify achievement is calculated from scratch
			expect(result.streaks.currentAttendanceStreak).toBe(1);
			expect(result.streaks.bestAttendanceStreak).toBe(1);
			expect(result.streaks.currentRunningStreak).toBe(1);
			expect(result.streaks.bestRunningStreak).toBe(1);
			expect(result.lastActivityId).toBe("6");
		}),
	);

	it(
		"should calculate achievement only for new activities when last activity is found",
		withTestContext(async () => {
			const timestamp = Date.now() - 7 * 24 * 60 * 60 * 1000;
			const dt = DateTime.fromMillis(timestamp, { zone: "Asia/Saigon" });
			const weekId =
				`${dt.year}-W${dt.weekNumber.toString().padStart(2, "0")}` as WeekId;
			await setupWeeklyGoals(weekId);

			// save activities for the week 1
			await generateWeekActivities("athlete1", timestamp);

			const resultWeek1 = await query_getAchievementForAthlete("athlete1");
			expect(resultWeek1.lastActivityId).toBe("6");

			// Calculate achievement
			const result = await query_getAchievementForAthlete("athlete1");

			// Verify achievement is calculated only for new activities
			expect(result.streaks.currentAttendanceStreak).toBe(1);
			expect(result.streaks.bestAttendanceStreak).toBe(1);
			expect(result.streaks.currentRunningStreak).toBe(1);
			expect(result.streaks.bestRunningStreak).toBe(1);
			expect(result.lastActivityId).toBe("6");

			// delete the activities for the week 1, except for the last activity
			const db = getMongoDB();
			await db
				.collection<ActivitiesCollectionDocument>(ActivitiesCollectionName)
				.deleteMany({
					attendanceId: "athlete1",
					id: { $lt: "6" },
				});

			// add new activities for the week 2 and setup weekly goals for the week 2
			const week2Timestamp = timestamp + 7 * 24 * 60 * 60 * 1000;
			await generateWeekActivities("athlete1", week2Timestamp);
			const week2Id =
				`${DateTime.fromMillis(week2Timestamp, { zone: "Asia/Saigon" }).toFormat("yyyy-'W'WW")}` as WeekId;
			await setupWeeklyGoals(week2Id);

			// calculate achievement for the week 2
			const resultWeek2 = await query_getAchievementForAthlete("athlete1");
			expect(resultWeek2.lastActivityId).toBe("12");

			// Verify achievement is calculated only for new activities
			expect(resultWeek2.streaks.currentAttendanceStreak).toBe(2);
			expect(resultWeek2.streaks.bestAttendanceStreak).toBe(2);
			expect(resultWeek2.streaks.currentRunningStreak).toBe(2);
			expect(resultWeek2.streaks.bestRunningStreak).toBe(2);
		}),
	);

	it(
		"should handle NoGoalFoundError by ensuring goal exists",
		withTestContext(async () => {
			const db = getMongoDB();

			const timestamp = Date.now() - 7 * 24 * 60 * 60 * 1000;
			const weekId =
				`${DateTime.fromMillis(timestamp, { zone: "Asia/Saigon" }).toFormat("yyyy-'W'WW")}` as WeekId;

			// Add activities without setting up weekly goals first
			await generateWeekActivities("athlete1", timestamp);

			// Calculate achievement - this should trigger NoGoalFoundError internally
			// and the function should handle it by ensuring the goal exists
			const result = await query_getAchievementForAthlete("athlete1");

			// Verify achievement is calculated correctly
			expect(result.streaks.currentAttendanceStreak).toBe(1);
			expect(result.streaks.bestAttendanceStreak).toBe(1);
			expect(result.streaks.currentRunningStreak).toBe(1);
			expect(result.streaks.bestRunningStreak).toBe(1);
			expect(result.lastActivityId).toBe("6");

			// Verify that the weekly goal was created
			const weeklyGoal = await db
				.collection<WeeklyGoalsCollectionDocument>(WeeklyGoalsCollectionName)
				.findOne({ weekId });
			expect(weeklyGoal).not.toBeNull();
		}),
	);

	it(
		"should handle year transitions correctly",
		withTestContext(async () => {
			// Create timestamps for the last week of one year and first week of next year
			const lastWeekOfYear = DateTime.fromObject(
				{ weekYear: 2023, weekNumber: 52 },
				{ zone: "Asia/Saigon" },
			).toMillis();
			const firstWeekOfYear = DateTime.fromObject(
				{ weekYear: 2024, weekNumber: 1 },
				{ zone: "Asia/Saigon" },
			).toMillis();

			// Setup weekly goals for both weeks
			const lastWeekId = "2023-W52" as WeekId;
			const firstWeekId = "2024-W01" as WeekId;
			await setupWeeklyGoals(lastWeekId);
			await setupWeeklyGoals(firstWeekId);

			// Add activities for both weeks
			await generateWeekActivities("athlete1", lastWeekOfYear);
			await generateWeekActivities("athlete1", firstWeekOfYear);

			// Calculate achievement
			const result = await query_getAchievementForAthlete("athlete1");

			// Verify streaks continue across year boundary
			expect(result.streaks.currentAttendanceStreak).toBe(2);
			expect(result.streaks.bestAttendanceStreak).toBe(2);
			expect(result.streaks.currentRunningStreak).toBe(2);
			expect(result.streaks.bestRunningStreak).toBe(2);
			expect(result.lastActivityId).toBe("12");
		}),
	);

	it(
		"should handle incomplete activity sets correctly",
		withTestContext(async () => {
			const db = getMongoDB();
			const activitiesCollection = db.collection<ActivitiesCollectionDocument>(
				ActivitiesCollectionName,
			);

			const timestamp = Date.now();
			const oneHour = 60 * 60 * 1000;
			const weekId =
				`${DateTime.fromMillis(timestamp, { zone: "Asia/Saigon" }).toFormat("yyyy-'W'WW")}` as WeekId;
			await setupWeeklyGoals(weekId);

			// Add incomplete set of activities (missing one personal technique and endurance runs)
			const activities = [
				{
					id: "1",
					attendanceId: "athlete1",
					activity: "30-minutes-session",
					thirtyMinActivity: "personal-technique",
					thirtyMinExplanation: "Practice personal technique",
					activityTimestamp: timestamp,
					submittedAt: timestamp,
				},
				{
					id: "2",
					attendanceId: "athlete1",
					activity: "30-minutes-session",
					thirtyMinActivity: "probability-practice",
					practiceType: "layup",
					practiceLevel: "1",
					practiceDescription: "Practice layup",
					activityTimestamp: timestamp + oneHour,
					submittedAt: timestamp + oneHour,
				},
				{
					id: "3",
					attendanceId: "athlete1",
					activity: "30-minutes-session",
					thirtyMinActivity: "buddy-training",
					thirtyMinExplanation: "Train with buddy",
					activityTimestamp: timestamp + 2 * oneHour,
					submittedAt: timestamp + 2 * oneHour,
				},
			] as const;

			await activitiesCollection.insertMany(activities);

			// Calculate achievement
			const result = await query_getAchievementForAthlete("athlete1");

			// Verify incomplete activities don't count towards streaks
			expect(result.streaks.currentAttendanceStreak).toBe(0);
			expect(result.streaks.bestAttendanceStreak).toBe(0);
			expect(result.streaks.currentRunningStreak).toBe(0);
			expect(result.streaks.bestRunningStreak).toBe(0);
			expect(result.lastActivityId).toBe("3");
			expect(result.weeklyActivities).toEqual({
				enduranceRun: 0,
				personalTechnique: 1,
				probabilityPractice: 1,
				buddyTraining: 1,
			});
		}),
	);

	it(
		"should handle non-consecutive weeks correctly",
		withTestContext(async () => {
			// Use absolute weeks in 2024
			const week1Timestamp = DateTime.fromObject(
				{ weekYear: 2024, weekNumber: 1 },
				{ zone: "Asia/Saigon" },
			).toMillis();
			const week3Timestamp = DateTime.fromObject(
				{ weekYear: 2024, weekNumber: 3 },
				{ zone: "Asia/Saigon" },
			).toMillis();

			// Add activities for week 1
			await generateWeekActivities("athlete1", week1Timestamp);

			// Calculate achievement after week 1
			const resultWeek1 = await query_getAchievementForAthlete("athlete1");
			expect(resultWeek1.streaks.currentAttendanceStreak).toBe(1);
			expect(resultWeek1.streaks.bestAttendanceStreak).toBe(1);
			expect(resultWeek1.streaks.currentRunningStreak).toBe(1);
			expect(resultWeek1.streaks.bestRunningStreak).toBe(1);
			expect(resultWeek1.lastActivityId).toBe("6");

			// Add activities for week 3 (skipping week 2)
			await generateWeekActivities("athlete1", week3Timestamp);

			// Calculate achievement after week 3
			const resultWeek3 = await query_getAchievementForAthlete("athlete1");

			// Verify streaks are broken by the gap
			expect(resultWeek3.streaks.currentAttendanceStreak).toBe(1);
			expect(resultWeek3.streaks.bestAttendanceStreak).toBe(1);
			expect(resultWeek3.streaks.currentRunningStreak).toBe(1);
			expect(resultWeek3.streaks.bestRunningStreak).toBe(1);
			expect(resultWeek3.lastActivityId).toBe("12");
		}),
	);
});
